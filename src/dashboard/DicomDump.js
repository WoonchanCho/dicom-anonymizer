import React, { useEffect, useState } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import dcmjs from 'dcmjs';
const { DicomMetaDictionary } = dcmjs.data;

const useStyles = makeStyles({
  container: {
    margin: 10,
  },
  table: {
    minWidth: 650,
  },
});

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

export default function DicomDump({ dicomDict, diff = {} }) {
  return (
    <>
      {dicomDict && (
        <>
          {/* <DisplayTags
            title="Dicom-Meta-Information-Header"
            dict={dicomDict.meta}
            diff={diff.meta}
          /> */}
          <DisplayTags
            title="Dicom-Data-Set"
            dict={dicomDict.dict}
            diff={diff.dict}
          />
        </>
      )}
    </>
  );
}

function DisplayTags({ title, dict, diff = {} }) {
  const classes = useStyles();
  const [ui, setUi] = useState(undefined);

  useEffect(() => {
    function row(key) {
      const punctuatedTag = DicomMetaDictionary.punctuateTag(key);
      let desc = '';
      if (punctuatedTag && DicomMetaDictionary.dictionary[punctuatedTag]) {
        desc = DicomMetaDictionary.dictionary[punctuatedTag].name;
      }
      const style = key in diff ? { backgroundColor: 'yellow' } : {};

      return (
        <TableRow key={key} style={style}>
          <TableCell component="th" scope="row">
            {punctuatedTag}
          </TableCell>
          <TableCell>{dict[key].vr}</TableCell>
          <TableCell>
            {Array.isArray(dict[key].Value)
              ? dict[key].Value.map((val, idx) => displayValue(key, val)).join(
                  '\\'
                )
              : dict[key].Value}
          </TableCell>
          <TableCell></TableCell>
          <TableCell>{desc}</TableCell>
        </TableRow>
      );
    }

    function displayValue(key, val) {
      if (val === undefined) {
        return undefined;
      }
      if (typeof val === 'object') {
        if (val instanceof ArrayBuffer) {
          return buf2hex(val);
        } else {
          // DisplayTags({ dict: val });
          return <DisplayTags dict={val} />;
        }
      } else {
        return val.toString();
      }
    }

    setUi(
      <>
        {title && `# ${title}`}
        <TableContainer component={Paper} className={classes.container}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Tag</StyledTableCell>
                <StyledTableCell>VR</StyledTableCell>
                <StyledTableCell>Value</StyledTableCell>
                <StyledTableCell>Length</StyledTableCell>
                <StyledTableCell>Description</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>{Object.keys(dict).sort().map(row)}</TableBody>
          </Table>
        </TableContainer>
      </>
    );
  }, [dict]);

  return ui ? ui : <></>;
}

function buf2hex(buffer) {
  const trimBytes = 16;
  const trail = buffer.byteLength > trimBytes ? '...' : '';
  // buffer is an ArrayBuffer
  return (
    '[' +
    Array.prototype.map
      .call(new Uint8Array(buffer.slice(0, trimBytes)), (x) =>
        ('00' + x.toString(16)).slice(-2)
      )
      .join(' ') +
    trail +
    '] '
  );
}
