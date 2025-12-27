import {
  LitElement,
  html,
} from "lit";

import style from './style.js';

import NationalrailStatusCardEditor from './index-editor.js';
import { destinationPresent, parseToTime, status } from './utils.js';

const cardName = 'nationalrail-status-card';
const editorName = cardName + '-editor';
customElements.define(editorName, NationalrailStatusCardEditor);

class NationalrailStatusCard extends LitElement {
  static properties = {
    attributes: {}
  };

  static styles = style;
  static getConfigElement() {
    return document.createElement(editorName);
  }
  set hass(hass) {
    this._hass = hass;
    this.updateProperties();
  }

  // required
  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this._config = config;
    this.updateProperties();
  }
  updateProperties() {
    if (!this._config || !this._hass) {
      return;
    }

    const entity = this._config.entity;
    const entityIndex = entity?.entity ?? entity;
    if (!entityIndex) {
      return;
    }

    const hassentity = this._hass.states[entityIndex]
    this.attributes = hassentity.attributes;
  }

  filterByPlatforms(trains) {
    if (!this._config?.platforms || typeof this._config.platforms !== 'string') {
      return trains;
    }
    
    const platformsStr = this._config.platforms.trim();
    if (!platformsStr) {
      return trains;
    }
    
    const platformList = platformsStr.split(',').map(p => p.trim()).filter(p => p);
    if (platformList.length === 0) {
      return trains;
    }
    
    return trains.filter(train => {
      const trainPlatform = train.platform ?? '-';
      return platformList.includes(String(trainPlatform));
    });
  }

  groupByPlatform(trains) {
    const grouped = new Map();
    
    trains.forEach(train => {
      const platform = train.platform ?? '-';
      if (!grouped.has(platform)) {
        grouped.set(platform, []);
      }
      grouped.get(platform).push(train);
    });
    
    return grouped;
  }

  sortPlatforms(platformKeys) {
    return platformKeys.sort((a, b) => {
      // Handle unknown/missing platforms
      const aIsUnknown = a === '-' || a === null || a === undefined;
      const bIsUnknown = b === '-' || b === null || b === undefined;
      
      if (aIsUnknown && !bIsUnknown) return 1;
      if (!aIsUnknown && bIsUnknown) return -1;
      if (aIsUnknown && bIsUnknown) return 0;
      
      // Convert to strings for comparison
      const aStr = String(a);
      const bStr = String(b);
      
      // Check if purely numeric
      const aNum = parseInt(aStr);
      const bNum = parseInt(bStr);
      const aIsNumeric = !isNaN(aNum) && aStr === String(aNum);
      const bIsNumeric = !isNaN(bNum) && bStr === String(bNum);
      
      if (aIsNumeric && bIsNumeric) {
        return aNum - bNum;
      }
      
      if (aIsNumeric && !bIsNumeric) return -1;
      if (!aIsNumeric && bIsNumeric) return 1;
      
      // Both alphanumeric - sort alphabetically
      return aStr.localeCompare(bStr);
    });
  }
  render() {
    let trains = this.attributes?.trains ?? [];
    
    // Apply platform filtering first
    if (this._config?.platforms) {
      trains = this.filterByPlatforms(trains);
    }
    
    // Apply limit
    if (this._config?.limit) {
      let limit = 0;
      if (typeof this._config.limit === 'number') {
        limit = this._config.limit;
      }
      else if (typeof this._config.limit === "string") {
        limit = parseInt(this._config.limit);
      }
      if (limit > 0) {
        trains = trains.slice(0, limit);
      }
    }
    
    let items = html`
    <h3>No trains scheduled</h3>
    `
    
    if (trains && trains.length > 0) {
      if (this._config?.group_by_platform) {
        // Group trains by platform
        const grouped = this.groupByPlatform(trains);
        const sortedPlatforms = this.sortPlatforms(Array.from(grouped.keys()));
        items = sortedPlatforms.map(platform => 
          this.renderPlatformGroup(platform, grouped.get(platform))
        );
      } else {
        // Normal flat list
        items = trains.map(train => this.renderTrain(train));
      }
    }
    
    return html`<ha-card>
      <div id="content">
      <div id="nationalrail-status">
      <h2>${this.attributes?.station}</h3>
      ${items}
      </div>
      </div>
    </ha-card>`
  }


  renderTrain(train) {
    const scheduled = parseToTime(train.scheduled);
    const showOperator = this._config?.show_operator !== false; // default true
    const showServiceType = this._config?.show_service_type !== false; // default true
    const showTrainLength = this._config?.show_train_length !== false; // default true
    
    return html`
    <div class="train">
      <div class="top-heading">
        <div class="scheduled-container">
          <span class="scheduled">${scheduled}</span>
          <span class="scheduled-status">${status(train)}</span>
        </div>
        <div class="platform-container">
          <span class="platform-label">Platform </span>
          <span class="platform">${train.platform ?? "-"}</span>
        </div>
      </div>
      
      ${(train.operator || train.service_type || train.length) ? html`
        <div class="train-metadata">
          ${train.operator && showOperator ? html`
            <span class="operator" title="Operator">${train.operator}</span>
          ` : ''}
          ${train.service_type && showServiceType ? html`
            <span class="service-type" title="Service Type">${train.service_type}</span>
          ` : ''}
          ${train.length && showTrainLength ? html`
            <span class="train-length" title="Train Length">${train.length} ${train.length === 1 ? 'carriage' : 'carriages'}</span>
          ` : ''}
        </div>
      ` : ''}
      
      <h3 
        id="station-heading-0" 
        tabindex="-1">
        <span class="terminus">${train.terminus}</span>
      </h3>
      <h4>Calling at ${train.destinations.map(dest => destinationPresent(dest, train.expected)).join(", ")}</h4 >
    </div >
      `
  }

  renderPlatformGroup(platform, trains) {
    const platformLabel = platform === '-' ? 'Unknown Platform' : `Platform ${platform}`;
    return html`
      <div class="platform-group">
        <div class="platform-header">${platformLabel}</div>
        ${trains.map(train => this.renderTrain(train))}
      </div>
    `;
  }

}



customElements.define(cardName, NationalrailStatusCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: cardName,
  name: 'Nationalrail Status Card',
  description: 'Card showing the status of the London Underground lines',
});