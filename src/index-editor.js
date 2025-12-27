import {
  html,
} from "lit";

import EditorForm from '@marcokreeft/ha-editor-formbuilder';
import { FormControlType } from '@marcokreeft/ha-editor-formbuilder/dist/interfaces.js';
import { getEntitiesByDomain } from '@marcokreeft/ha-editor-formbuilder/dist/utils/entities.js';


function filterTrainEntities(_hass, items) {
  return items.filter(item => {
    return item.value.startsWith("sensor.train_schedule");
  });
}

export default class NationalrailStatusCardEditor extends EditorForm {

  static get properties() {
    return { _hass: {}, _config: {} };
  }

  setConfig(config) {
    this._config = config;
  }

  render() {
    if (!this._hass || !this._config) {
      return html``;
    }
    return this.renderForm([
      { controls: [{ label: "Entity", configValue: "entity", type: FormControlType.Dropdown, items: filterTrainEntities(this._hass, getEntitiesByDomain(this._hass, "sensor")) }] },
      { controls: [{ label: "Number of trains to show", configValue: "limit", type: FormControlType.Textbox }] },
      { controls: [{ label: "Group by platform", configValue: "group_by_platform", type: FormControlType.Switch }] },
      { controls: [{ label: "Filter by platforms (comma-separated, e.g. 1,2,3A)", configValue: "platforms", type: FormControlType.Textbox }] },
      { controls: [{ label: "Show operator name", configValue: "show_operator", type: FormControlType.Switch }] },
      { controls: [{ label: "Show service type", configValue: "show_service_type", type: FormControlType.Switch }] },
      { controls: [{ label: "Show train length", configValue: "show_train_length", type: FormControlType.Switch }] },
    ])
  };
}