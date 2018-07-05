import { elastic } from '../constants';
import React from 'react';
import axios from 'axios';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';
import Fade from '@material-ui/core/Fade';
import './GetAll.css';

class GetAll extends React.Component {
  state = { result : [], deleted: false };

  async getAll() {
    const result = await axios.post(`${elastic}/_search`, { size: 100 });
    return await result.data.hits.hits;
  }

  componentDidMount() {
    axios.post(`${elastic}/_search`, { size: 100 }).then(result => {
      this.setState({ result: result.data.hits.hits });
    });
  }

  promiseTimeout(time) {
    return new Promise(function(resolve,reject) {
      setTimeout(function() { resolve(time); }, time);
    });
  };

  handleDelete = (id) => {
    /*
    // Below code prior to refresh parameter
    axios.delete(`${elastic}/${id}`).then(() => {
      return this.promiseTimeout(1000);
    }).then(() => {
      return axios.post(`${elastic}/_search`);
    }).then(result => {
      this.setState({ deleted: true, result: result.data.hits.hits });
    });
    */

    axios.delete(`${elastic}/${id}?refresh`).then(() => {
      return axios.post(`${elastic}/_search`);
    }).then(result => {
      this.setState({ deleted: true, result: result.data.hits.hits });
    });
  };

  handleSnackClose = () => {
    this.setState({ deleted: false });
  };

  render() {
    return (
      <div className={'getall-page'}>
        <Table className={'table'}>
          <TableBody>
            {this.state.result.map((hit) =>
              <TableRow key={hit._id} hover>
                <TableCell className={'text'}>
                  {hit._source.text1}
                </TableCell>
                <TableCell className={'hoverMenu'}>
                  <IconButton className={'deleteButton'} onClick={this.handleDelete.bind(this, hit._id)} color='inherit'>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Snackbar
          open={this.state.deleted}
          anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
          message={'Deleted'}
          autoHideDuration={1200}
          onClose={this.handleSnackClose}
          TransitionComponent={Fade}
          action={[
            <IconButton key='close' onClick={this.handleSnackClose} color='inherit'>
              <CloseIcon />
            </IconButton>
          ]}
        />
      </div>
    );
  }
}

export default GetAll;
