import axios from "axios/index";
import {elastic} from "../constants";

export default class SearchPart {
  constructor(title, query, link) {
    this.title = title;
    this.link = link;
    this.query = query;
    this.result = '';
  }

  search(terms, callback) {
    const query = JSON.stringify(this.query).replace(/SEARCH_TERMS/, terms);
    axios.post(`${elastic}/_search`, query, { headers: { 'Content-Type': 'application/json', 'X-Opaque-Id': this.title }})
      .then(result => {
        this.result = result.data.hits.hits;
        callback(this.title, this);
    });
  }

  getTitle() {
    return this.title;
  }

  getResult() {
    return this.result;
  }

  getLink() {
    return this.link;
  }

  clear() {
    this.result = '';
  }
}