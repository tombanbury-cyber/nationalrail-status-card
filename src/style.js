

import { css } from 'lit';

const style = css`
#nationalrail-status {
  padding:16px;
}
.train {
  display:flex;
  flex-direction:column;
  padding:5px;
  border:1px white solid;
  border-radius: 5px;
  margin: 2px 0px;
}
.top-heading {
  display:flex;
  flex-direction:row;
  flex-basis:100%;
  margin-bottom:5px;
}
.scheduled-container {
  display:flex;
  flex-basis:100%;
}
.scheduled-status {
  padding-left: 5px;
}
.platform-container {
  display:flex;
}
.platform-label {
  padding-right: 5px;
}
.details {
  margin-top:5px;
}
h3, h4 {
  margin:0;
}
h4 {
  font-style: italic;
  font-weight: 500;
}
.peturbed {
color: #ff4141;
}
.warning {
color: #f3f345;
}
.good {
color: #52ff52;
}
.train-metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 5px;
  font-size: 0.9em;
}
.train-metadata > span {
  padding: 2px 8px;
  border-radius: 3px;
  background: var(--card-background-color, rgba(var(--rgb-primary-text-color, 255, 255, 255), 0.05));
  border: 1px solid var(--divider-color, rgba(var(--rgb-primary-text-color, 255, 255, 255), 0.12));
}
.operator {
  color: #4da6ff;
}
.service-type {
  color: #ffd966;
}
.train-length {
  color: #b3b3b3;
}
`;

export default style;
