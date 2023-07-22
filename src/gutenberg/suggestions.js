import {select} from '@wordpress/data';
import {TYPE_ERROR, TYPE_OK, TYPE_WARN, TYPE_INFO} from './types';
import {extractURL, extractTextContent, getTextWidth} from './utils';

export const generateSuggestions = () => {
  const {getEditedPostContent} = select('core/editor');
  const postContent = getEditedPostContent();

  let suggestions = {
    [TYPE_OK]: {title: 'Passed Assestments', items: []},
    [TYPE_ERROR]: {title: 'Errors', items: []},
    [TYPE_WARN]: {title: 'Warnings', items: []},
    [TYPE_INFO]: {title: 'General Info', items: []},
  };

  const checklist = [
    titleCheck(),
    metaTitleCheck(),
    metaDescriptionCheck(),
    imgAltCheck(postContent),
    noFeatImgCheck(),
    innerAnchorsCheck(postContent),
    iframeCheck(postContent)
  ];

  checklist.filter(el => el != null).forEach(elem => {
    suggestions[elem.res].items = [...suggestions[elem.res].items, elem];
  });

  return suggestions;
};

const createSuggestion = (type, errorMessage, okMessage, occurrences, hint) => {
  if (Array.isArray(occurrences))
    occurrences = occurrences.filter(e => !!e);

  const isError = occurrences === 1 || occurrences.length > 0;
  let message = isError ? errorMessage : okMessage;
  let res = isError ? type : TYPE_OK;

  return {res, message, occurrences, hint};
};


const createOccurence = (selector, title, searchTerm) => {
  let newSelector = selector ? `.editor-styles-wrapper ${selector}` : null;

  return {selector: newSelector, title: title, searchTerm: searchTerm || title};
};

// Create suggestion with images without an alt text.
const imgAltCheck = (content) => {
  let errorMessage = 'Found images missing the alt text.';
  let okMessage = 'All images have alt text.';
  let hint = '';
  let matches = 0;
  if (content.indexOf('<img') !== -1) {
    matches = content.match(/<img(.*)alt=""(.*?)>/g) || [];
    matches = matches.map(e => {
      let imgURL = extractURL(e);
      let res = null;

      if (imgURL) {
        res = createOccurence(`img[src="${imgURL}"]`, imgURL.split('/').pop());
      }
      else {
        res = createOccurence(null, 'Found an empty block image.');
      }

      return res;
    });
  }
  else {
    okMessage = 'No issues with images.';
  }
  return createSuggestion(TYPE_ERROR, errorMessage, okMessage, matches, hint);
};

// Create suggestion with iframes that are not lazyloaded
const iframeCheck = (content) => {
  let errorMessage = 'Found iframes that are missing the loading="lazy" property.';
  let okMessage = 'All iframes are being lazyloaded.';
  let hint = 'Add loading="lazy" to the iframe code.';
  let matches = content.match(/<iframe(.*)>/g) || [];
  let counter = matches.length;
  matches = matches.filter(e => e.indexOf('loading="lazy"') === -1);

  if (counter === 0)
    okMessage = 'No issues with iframes.';

  if (matches.length > 0) {
    matches = matches.map(e => {
      let url = extractURL(e);
      let res = null;
      if (url)
        res = createOccurence(`iframe[src="${url}"]`, url);

      return res;
    });
  }

  return createSuggestion(TYPE_ERROR, errorMessage, okMessage, matches, hint);
};

const textLengthCheck = (label, text, fontSize, maxLength, showLength = true) => {
  let errorMessage = `${label} length should be under ${maxLength}px.`;
  let okMessage = `${label} length is under ${maxLength}px.`;
  let occurrences = 1;

  if (text === null || text == '') {
    errorMessage = `${label} is empty.`;
  }
  else {
    let length = Math.ceil(getTextWidth(text, `${fontSize}px`));

    if (length <= maxLength) {
      occurrences = 0;
    }

    if (showLength) {
      let tmp = ` [Currently ~${length}px or more]`;

      if (occurrences) {
        errorMessage += tmp;
      }
      else {
        okMessage += tmp;
      }
    }
  }
  return {errorMessage, okMessage, occurrences};
};

const titleCheck = () => {
  const title = select('core/editor').getEditedPostAttribute('title');

  const {errorMessage, okMessage, occurrences} = textLengthCheck('Post\'s title', title, 20, 580);
  let hint = '';

  return createSuggestion(TYPE_ERROR, errorMessage, okMessage, occurrences, hint);
};

const metaTitleCheck = () => {
  const metaTitle = document.querySelector('#yoast-snippet-preview-container > div:first-child > div:nth-of-type(2) span');

  if (metaTitle) {
    const {errorMessage, okMessage, occurrences} = textLengthCheck('Post\'s meta title', metaTitle.textContent, 20, 580);
    let hint = '';

    return createSuggestion(TYPE_ERROR, errorMessage, okMessage, occurrences, hint);
  }
  else {
    //YOAST is not enabled or selector changed
    return null;
  }
};

const metaDescriptionCheck = () => {
  const descInput = document.getElementById('yoast_wpseo_metadesc');
  if (descInput) {
    const {errorMessage, okMessage, occurrences} = textLengthCheck('Post\'s meta description', descInput.value, 14, 990, true);
    let hint = '';

    return createSuggestion(TYPE_ERROR, errorMessage, okMessage, occurrences, hint);
  }
  else {
    //TODO add case to whenever YOAST is not enabled
    return null;
  }
};

const noFeatImgCheck = () => {
  let errorMessage = 'The post is missing a featured image.';
  let okMessage = 'Featured image set correctly.';
  let hint = '';
  let hasFeatImg = select('core/editor').getEditedPostAttribute('featured_media') !== 0;

  return createSuggestion(TYPE_ERROR, errorMessage, okMessage, hasFeatImg ? 0 : 1, hint);
};

const innerAnchorsCheck = (content) => {
  let errorMessage = 'Found broken anchor links.';
  let okMessage = 'All inner anchor links are set properly.';
  let hint = '';
  let matches = content.match(/<a(.*)href="#(.+?)">(.*?)<\/a>/g) || [];

  if (matches.length === 0)
    okMessage = 'No issues with inner anchor links.';

  matches = matches.map( e => {
    let id = e.match('"#(.*?)"');
    let res = null;

    if (id) {
      id = id.pop().replace('"', '');

      if (content.indexOf(`id="${id}"`) === -1 && content.indexOf(`anchor="${id.replace('rank-table-', '')}"`) === -1) {
        //@TODO FIX SELECTOR
        // res = createOccurence(`a[href="#${id}"]`, `${extractTextContent(e)} -> #${id}`);
        res = createOccurence(null, `${extractTextContent(e)} -> #${id}`);
      }
    }

    return res;
  });

  return createSuggestion(TYPE_ERROR, errorMessage, okMessage, matches, hint);
};