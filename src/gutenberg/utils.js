export const extractURL = (text) => {
  let res = null;
  let match = text.match(/(src|href)="(.*?)"/);

  if (match && match.length >= 3) {
    res = match[2];
  }

  return res;
};

export const extractTextContent = (text) => {
  return text.replace(/<(.*?)>(.*)<\/(.*?)>/g, '$2').replace( /(<([^>]+)>)/ig, '');
};

export const getTextWidth = (text, fontSize = '14px', fontFamily = 'Roboto, arial, sans-serif') => {
  const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
  const context = canvas.getContext('2d');
  context.font = `normal ${fontSize} ${fontFamily}`;
  const metrics = context.measureText(text);

  return metrics.width;
};