import React from 'react';
import './SearchPart.css';

class SearchPart extends React.Component {
  render() {
    const model = this.props.model;

    return (
      model.getResult() ?
        <div className={'search-part'}>
          {getTitle(model)}
          {model.getResult().map(hit =>
            <div key={hit._id}>
              {hit._source.text1}
            </div>)}
        </div> :
        null
    );
  }
}

const getTitle = model => {
  if (model.getLink()) {
    return <a href={model.getLink()} target={'_blank'} className={'title'}>{model.getTitle()}</a>;
  }

  return <div className={'title'}>{model.getTitle()}</div>;
};

export default SearchPart;