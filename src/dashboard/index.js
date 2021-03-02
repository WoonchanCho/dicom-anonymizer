import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import DicomDump from './DicomDump';
import Dropzone from './Dropzone';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import dcmjs from 'dcmjs';
import { SAMPLE_DCM } from '../common/constant';

import Anonymizer from 'dicomedit';
import { transform, isEqual, isObject } from 'lodash';

/**
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
function difference(object, base) {
  return transform(object, (result, value, key) => {
    if (!isEqual(value, base[key])) {
      result[key] =
        isObject(value) && isObject(base[key])
          ? difference(value, base[key])
          : value;
    }
  });
}

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const { DicomDict } = dcmjs.data;

const useStyles = makeStyles((theme) => ({
  container: {
    margin: 10,
  },
  text: {
    width: '100%',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  root: {},
  button: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(1),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

function Dashboard() {
  const classes = useStyles();

  const [dcmFile, setDcmFile] = useState(undefined);
  const [inputDict, setInputDict] = useState(undefined);
  const [inputDiff, setInputDiff] = useState(undefined);
  const [outputDict, setOutputDict] = useState(undefined);
  const [outputDiff, setOutputDiff] = useState(undefined);
  const [buffer, setBuffer] = useState(undefined);
  const [text, setText] = useState(
    `version "6.3"
(0008,0080) := "Washington University School of Medicine"
(0008,0018) := hashUID[(0008,0018)]
// Add 14 days to Study Date
(0008,0020) := shiftDateByIncrement[ (0008,0020), "14"]
- (0008,0021)
`
  );
  const [parserLibrary, setParserLibrary] = useState('ANTLR4');

  const [error, setError] = React.useState({ open: false, message: '' });

  async function onFileSelected(file) {
    try {
      setDcmFile(file);
      const buffer = await file.arrayBuffer();
      await load(buffer);
    } catch (err) {
      setError({ open: true, message: err.message });
    }
  }

  async function load(buffer) {
    setBuffer(buffer);
    const anonymizer = new Anonymizer(text, { parserLibrary });
    anonymizer.loadDcm(buffer);
    await anonymizer.applyRules();

    const outputDiff = difference(anonymizer.outputDict, anonymizer.inputDict);

    const inputDiff = difference(anonymizer.inputDict, anonymizer.outputDict);

    setOutputDiff(outputDiff);
    setInputDiff(inputDiff);
    setInputDict(anonymizer.inputDict);
    setOutputDict(anonymizer.outputDict);
  }

  const handleChange = (event) => {
    setText(event.target.value);
  };
  const handleLibraryChange = (event) => {
    setParserLibrary(event.target.value);
  };

  function onSave() {
    const newDicomDict = new DicomDict(outputDict.meta);
    newDicomDict.dict = outputDict.dict;
    try {
      const buffer = newDicomDict.write();

      const link = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link);

      const blob = new Blob([buffer], { type: 'application/octet' });
      const objectURL = URL.createObjectURL(blob);

      link.href = objectURL;
      link.href = URL.createObjectURL(blob);
      link.download = dcmFile ? dcmFile.name : 'anonymized.dcm';
      link.click();
    } catch (err) {
      setError({ open: true, message: err.message });
    }
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setError({ open: false, message: '' });
  };

  async function applySample() {
    try {
      const buffer = _base64ToArrayBuffer(SAMPLE_DCM);
      await load(buffer);
    } catch (err) {
      setError({ open: true, message: err.message });
    }
  }

  function _base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }
  async function refreshScript() {
    try {
      await load(buffer);
    } catch (err) {
      setError({ open: true, message: err.message });
    }
  }
  return (
    <Container maxWidth="xl" className={classes.root}>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={error.open}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error">
          {error.message}
        </Alert>
      </Snackbar>

      {/* <Typography component="div" style={{ backgroundColor: '#cfe8fc' }} /> */}
      <Grid container spacing={3} style={{ marginTop: 10 }}>
        <Grid item xs={12} md={6}>
          1. Edit a DicomEdit script. (Please refer to{' '}
          <a href="https://wiki.xnat.org/xnat-tools/dicomedit" target="_blank">
            this
          </a>{' '}
          for the DicomEdit grammar)
          <TextField
            className={classes.text}
            label="DicomEdit"
            rows={6}
            multiline
            variant="outlined"
            value={text}
            onChange={handleChange}
          />
          <FormControl className={classes.formControl}>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={parserLibrary}
              onChange={handleLibraryChange}
            >
              <MenuItem value={'ANTLR4'}>ANTLR4</MenuItem>
              <MenuItem value={'PEGJS'}>PEGJS</MenuItem>
            </Select>
          </FormControl>
          {outputDict && (
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={refreshScript}
            >
              Refresh Script
            </Button>
          )}
          &nbsp;
          {outputDict && (
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={onSave}
              disabled={!outputDict}
            >
              Save
            </Button>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <Grid item xs={12} md={12}>
            2. Choose a dcm file. If you don't have one, just click the "Use
            Sample" button":
            <Button
              variant="outlined"
              color="primary"
              onClick={applySample}
              target="_blank"
              download
            >
              Use Sample
            </Button>
            <Dropzone onFileSelected={onFileSelected} />
          </Grid>
        </Grid>
      </Grid>
      <br />
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="flex-start"
        spacing={2}
      >
        <Grid item xs={12} md={6} alignItems="flex-start">
          <Typography variant="h5" component="h3">
            Before applying anonymization
          </Typography>
          <DicomDump dicomDict={inputDict} diff={inputDiff} />
        </Grid>

        <Grid item xs={12} md={6} alignItems="flex-start">
          <Typography variant="h5" component="h3">
            After applying anonymization
          </Typography>
          <DicomDump dicomDict={outputDict} diff={outputDiff} />
        </Grid>
      </Grid>
    </Container>
  );
}
export default Dashboard;
