import axios from "axios/index";
import {elastic} from "../constants";
import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import SearchPartModel from '../model/searchPart';
import SearchPart from './SearchPart';
import { withStyles } from '@material-ui/core/styles';
import './Search.css';


const renderInput = inputProps => {
  const {classes, ref, ...other} = inputProps;

  return (
    <TextField
      className={'search-input'}
      InputProps={{
        inputRef: ref,
        classes: {
          input: classes.input
        },
        ...other,
      }}
    />
  );
};

const getSuggestionValue = suggestion => suggestion;

const renderSuggestion = (suggestion, { query, isHighlighted }) => {
  const matches = match(suggestion, query);
  const parts = parse(suggestion, matches);

  return (
    <MenuItem selected={isHighlighted} component="div">
      <div>
        {parts.map((part, index) => {
          return part.highlight ? (
            <span key={String(index)} style={{ fontWeight: 700 }}>
              {part.text}
            </span>
          ) : (
            <strong key={String(index)} style={{ fontWeight: 300 }}>
              {part.text}
            </strong>
          );
        })}
      </div>
    </MenuItem>
  );
};

const renderSuggestionsContainer = options => {
  const { containerProps, children } = options;

  return (
    <Paper {...containerProps} square>
      {children}
    </Paper>
  );
};

const styles = theme => ({
  container: {
    flexGrow: 1,
    display: 'flex',
    position: 'relative'
  },
  suggestionsContainerOpen: {
    position: 'absolute',
    zIndex: 1,
    marginTop: 35,
    left: 0,
    right: 0,
  },
  suggestion: {
    display: 'block',
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
});


class Search extends React.Component {
  state = {
    text: '',
    suggestions: [],
    parts: {
      'match AND': new SearchPartModel('match AND', {
        query: {
          match: {
            text1: {
              query: 'SEARCH_TERMS',
              operator: 'AND',
              fuzziness: 1
            }
          }
        }
      }),
      'match OR': new SearchPartModel('match OR', {
        query: {
          match: {
            text1: {
              query: 'SEARCH_TERMS',
              operator: 'OR',
              fuzziness: 1
            }
          }
        }
      }),
      'phrase': new SearchPartModel('phrase', {
        query: {
          match_phrase: {
            text1: {
              query: 'SEARCH_TERMS',
              slop: 0
            }
          }
        }
      }),
      'phrase prefix': new SearchPartModel('phrase prefix', {
        query: {
          match_phrase_prefix: {
            text1: 'SEARCH_TERMS'
          }
        }
      }),
      'simple query': new SearchPartModel('simple query', {
        query: {
          simple_query_string: {
            fields: ['text1'],
            query: 'SEARCH_TERMS'
          }
        }
      }, 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-simple-query-string-query.html#_simple_query_string_syntax'),
      'term': new SearchPartModel('term', {
        query: {
          term: {
            text1: 'SEARCH_TERMS'
          }
        }
      }),
      'prefix': new SearchPartModel('prefix', {
        query: {
          prefix: {
            text1: 'SEARCH_TERMS'
          }
        }
      }),
      'wildcard': new SearchPartModel('wildcard', {
        query: {
          wildcard: {
            text1: 'SEARCH_TERMS'
          }
        }
      })
    }
  };

  handleTextChange = (e, {newValue}) => {
    this.setState({ text: newValue });
  };

  updatePart = (key, part) => {
    this.setState({ ['parts.' + key]: part });
  };

  handleSuggestionsFetchRequested = ({ value }) => {
    const query = {
      suggest: {
        'text1-completion': {
          prefix: value,
          completion: {
            field: "text1-completion",
            fuzzy: { fuzziness: 2 },
            size: 5
          }
        }
      }
    };

    axios.post(`${elastic}/_search`, query, { headers: { 'Content-Type': 'application/json', 'X-Opaque-Id': 'completion' }})
      .then(result => {
        const suggestions = result.data.suggest['text1-completion'][0].options.map(option => {
          return option._source.text1;
        });
        this.setState({ suggestions });
      });
  };

  handleSuggestionsClearRequested = () => {
    this.setState({ suggestions: [] });
  };

  handleSearch = term => {
    if (term) {
      for (const part of Object.values(this.state.parts)) {
        part.search(term, this.updatePart);
      }
    } else {
      for (const part of Object.values(this.state.parts)) {
        part.clear();
      }
      this.setState( { parts: this.state.parts });
    }
  };

  handleSuggestionSelected = (e, { suggestionValue }) => {
    this.handleSearch(suggestionValue);
  };

  handleKeyPress = e => {
    if (e.key === 'Enter') {
      this.handleSearch(this.state.text);
    }
  };

  render() {
    const { classes } = this.props;
    const inputProps = {
      classes,
      placeholder: 'Enter search terms',
      value: this.state.text,
      onChange: this.handleTextChange,
      onKeyPress: this.handleKeyPress
    };

    return <div className={'search-page'}>
      <div className={'search-row'}>
        <Autosuggest
          theme={{
            container: classes.container,
            suggestionsContainerOpen: classes.suggestionsContainerOpen,
            suggestionsList: classes.suggestionsList,
            suggestion: classes.suggestion,
          }}
          renderInputComponent={renderInput}
          suggestions={this.state.suggestions}
          onSuggestionsFetchRequested={this.handleSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.handleSuggestionsClearRequested}
          onSuggestionSelected={this.handleSuggestionSelected}
          renderSuggestionsContainer={renderSuggestionsContainer}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps} />

        <Button className={'button'} variant='contained' onClick={this.handleSearch}>Search</Button>
      </div>

      <div className={'result-panel'}>
        {Object.values(this.state.parts).map(part =>
          <SearchPart key={part.getTitle()} model={part} />
        )}
      </div>
    </div>;
  }
}

export default withStyles(styles)(Search);