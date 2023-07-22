import {registerPlugin} from '@wordpress/plugins';
import {PluginSidebar} from '@wordpress/edit-post';
import {PanelBody} from '@wordpress/components';
import {generateSuggestions} from './suggestions';
import {TYPE_ERROR, TYPE_OK, TYPE_WARN} from './types';
import domReady from '@wordpress/dom-ready';
import {RawHTML} from '@wordpress/element';



const Sidebar = () => {
  const res = generateSuggestions();
  const types = Object.keys(res);

  return (
    <PluginSidebar name="gcw" title="Gutenberg Content Watcher" className="gcw-panel" icon={`welcome-view-site gcw-icon gcw-icon-status-${getContentStatus(res[TYPE_ERROR], res[TYPE_WARN])}`}>
      {types.map(type => {
        const {title, items} = res[type];

        if (type === TYPE_OK && items.length > 0) {
          return (
            <PanelBody
              className={`incident-wrapper status-${type}`}
              title={`[${items.length}] ${title}`}
              initialOpen={type === TYPE_ERROR || type === TYPE_OK}
            >
              <ol className="incident-list">
                {items.map((item, i) =>
                  <li
                    className="incident"
                    id={`type-${type}-${i}`}
                    data-type={item.type}
                  >
                    <RawHTML>{item.message}</RawHTML>
                    {item.occurrences.length > 0 && (
                      <span className="incident-occurrences">
                        ({item.occurrences.length})
                      </span>
                    )}
                  </li>
                )}
              </ol>
            </PanelBody>
          );
        }
        else {
          return items.map(item => Array.isArray(item.occurrences) && item.occurrences.length > 0 ? renderSuggestionWithOcurrences(item, type) : renderSingleError(item, type));
        }

      })}
    </PluginSidebar>
  );
};

const renderSingleError = (item, type) => {
  return (
    <PanelBody
      className={`incident-wrapper no-children status-${type}`}
      title={`${item.message}`}
    >
    </PanelBody>
  );

};

const renderSuggestionWithOcurrences = (item, type) => {
  return (
    <PanelBody
      className={`incident-wrapper status-${type}`}
      title={`[${item.occurrences.length}] ${item.message}`}
      initialOpen={true}
    >
      <ol className="incident-list">
        {item.occurrences.map((incident) => <Incident {...incident} />)}
      </ol>
    </PanelBody>
  );
};


const Incident = ({selector, title, searchTerm}) => {
  let incidentContent = null;
  if (selector) {
    incidentContent = (
      <a
        href=""
        data-selector={selector}
        onClick={(e) => {
          e.preventDefault();
          let elem = document.querySelector(selector);

          if (elem === null)
            elem = getElementWithTextContent('textarea', searchTerm); // Get the element that contains the incident. It's a textarea if the issue is ocurrring in a custom HTML block.

          if (elem)
            elem.scrollIntoView({behavior: 'smooth', block: 'center'});
        }}
      >
        {title}
      </a>
    );
  }
  else {
    incidentContent = title;
  }

  return (
    <li className="incident"> {incidentContent}</li>
  );
};

// Get Node that contains a string
const getElementWithTextContent = (tagName, searchText) => {
  var tags = document.getElementsByTagName(tagName);
  var found;

  for (var i = 0; i < tags.length; i++) {
    if (tags[i].textContent.indexOf(searchText) !== -1) {
      found = tags[i];
      break;
    }
  }
  return found;
};

const getContentStatus = (errors, warnings) => {
  let res = 'ok';
  if (errors.items.length > 0) {
    res = 'error';
  }
  else if (warnings.items.length > 0) {
    res = 'warn';
  }

  return res;
};


domReady(function () {
  registerPlugin('gcw', {render: Sidebar});
});