import { elastic } from '../constants';
import React from 'react';
import axios from 'axios';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Fade from '@material-ui/core/Fade';
import './Insert.css';

class Insert extends React.Component {
  state = {
    text: '',
    textInserted: '',
    inserted: false
  };

  /** Tokenizes text into (auto)completion phrases.  Removes first word, second word, etc. */
  tokenize(text) {
    text = text.toLowerCase();
    const phrases = [ text ];
    let matches = text.match(/\s+/);
    let i = -1;
    if (matches && matches[0]) {
      i = matches.index + matches[0].length;
    }
    let ctr = 0;
    while (i !== -1 && ctr < 4) {  // insert 4 more phrases
      text = text.substring(i);
      phrases.push(text);
      matches = text.match(/\s+/);
      if (matches && matches[0]) {
        i = matches.index + matches[0].length;
      } else {
        i = -1;
      }
      ++ctr;
    }

    return phrases;
  }

  handleTextChange = e => {
    this.setState({ text: e.target.value });
  };

  handleInsertClick = () => {
    if (this.state.text) {
      axios.post(elastic, { text1: this.state.text, 'text1-completion': this.tokenize(this.state.text) }).then(() => {
        this.setState({ inserted: true, textInserted: this.state.text, text: '' });
      });
    }
  };

  handleClose = () => {
    this.setState({ inserted: false });
  };

  render() {
    return <div className={'insert-page'}>
      <TextField className={'text'} value={this.state.text} onChange={this.handleTextChange} multiline placeholder='Enter text to insert' />
      <Button className={'button'} variant='contained' onClick={this.handleInsertClick}>Insert</Button>
      <Snackbar
        open={this.state.inserted}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        message={'Inserted: ' + this.state.textInserted.substr(0, 50)}
        autoHideDuration={1200}
        onClose={this.handleClose}
        TransitionComponent={Fade}
        action={[
          <IconButton key='close' onClick={this.handleClose} color='inherit'>
            <CloseIcon />
          </IconButton>
        ]}
      />

    </div>;
  }
}

export default Insert;