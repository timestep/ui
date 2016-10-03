import React from 'react';
import {
  heroes,
  runes,
  items,
  order_types as orderTypes,
  item_ids as itemIds,
  ability_ids as abilityIds,
  ability_keys as abilityKeys,
  hero_names as heroNames,
} from 'dotaconstants';
import strings from 'lang';
import {
  Link,
} from 'react-router';
import {
  API_HOST,
} from 'config.js';
import {
  formatSeconds,
  abbreviateNumber,
} from 'utility';
// import { AppBadge } from '../Player';
import styles from './Match.css';

// {row.last_login && row.last_login && <span style={{ marginLeft: 3 }}><AppBadge /></span>}
export const heroTd = (row, col, field, hideName) => (
  <div style={{ marginTop: 5 }}>
    <div>
      <div className={row.isRadiant ? styles.radiant : styles.dire} />
      <img
        src={heroes[field] ? `${API_HOST}/apps/dota2/images/heroes/${heroes[field].name.substring('npc_dota_hero_'.length)}_full.png` : ''}
        style={{ height: 24 }}
        role="presentation"
      />
      {!hideName && <div>{row.account_id ? <Link to={`/players/${row.account_id}`}>{row.personaname}</Link> : 'Anonymous'}</div>}
    </div>
  </div>
);

export const heroTdColumn = {
  displayName: 'Player',
  field: 'hero_id',
  displayFn: heroTd,
  sortFn: (row) => (row.player_slot),
};

export const overviewColumns = [
  heroTdColumn, {
    displayName: 'MMR',
    field: 'solo_competitive_rank',
    sortFn: true,
  }, {
    displayName: 'LVL',
    field: 'level',

    sortFn: true,
  }, {
    displayName: 'K',
    field: 'kills',

    sortFn: true,
  }, {
    displayName: 'D',
    field: 'deaths',

    sortFn: true,
  }, {
    displayName: 'A',
    field: 'assists',

    sortFn: true,
  }, {
    displayName: 'LH',
    field: 'last_hits',

    sortFn: true,
  }, {
    displayName: 'DN',
    field: 'denies',

    sortFn: true,
  }, {
    displayName: 'G',
    field: 'gold_per_min',

    displayFn: (row) => abbreviateNumber((row.gold_per_min * row.duration) / 60),
    sortFn: true,
  }, {
    displayName: 'GPM',
    field: 'gold_per_min',

    sortFn: true,
  }, {
    displayName: 'XPM',
    field: 'xp_per_min',

    sortFn: true,
  }, {
    displayName: 'HD',
    field: 'hero_damage',

    displayFn: (row) => abbreviateNumber(row.hero_damage),
    sortFn: true,
  }, {
    displayName: 'TD',
    field: 'tower_damage',

    displayFn: (row) => abbreviateNumber(row.tower_damage),
    sortFn: true,
  }, {
    displayName: 'HH',
    field: 'hero_healing',

    displayFn: (row) => abbreviateNumber(row.hero_healing),
    sortFn: true,
  }, {
    displayName: 'Items',
    field: '',
    width: 7,
    displayFn: (row) => {
      const itemArray = [];
      for (let i = 0; i < 6; i++) {
        const itemKey = itemIds[row[`item_${i}`]];
        const item = items[itemKey];
        if (item) {
          itemArray.push(<span
            key={i}
            style={{ position: 'relative' }}
          >
            <img
              style={{ height: 25, margin: '0 3px' }}
              role="presentation"
              src={`${API_HOST}/apps/dota2/images/items/${itemKey}_lg.png`}
            />
            <span className={styles.timing}>
              {row.first_purchase_time && row.first_purchase_time[itemIds[item.id]]
                ? `${(row.first_purchase_time[itemIds[item.id]] / 60).toFixed(0)}'`
                : ''}
            </span>
          </span>);
        }
      }
      return itemArray;
    },
  },
];
export const abUpgradeColumns = [
  heroTdColumn,
].concat(Array.from(new Array(25)).map((e, i) => ({
  displayName: i + 1,
  field: 'ability_upgrades_arr',
  index: i,

  displayFn: (row, column, field) => {
    if (field) {
      const abilityId = field[column.index];
      const abilityKey = abilityIds[abilityId];
      let abilityData = null;
      if (abilityKey) {
        abilityData = {
          img: `${API_HOST}/apps/dota2/images/abilities/${abilityKey}_md.png`,
        };
      }
      if (abilityKey === 'attribute_bonus') {
        abilityData = {
          dname: 'Attribute Bonus',
          img: '/assets/images/stats.png',
          attrib: '+2 All Attributes',
        };
      }
      if (abilityData) {
        return (<img
          src={abilityData.img}
          style={{ height: 35, position: 'relative', left: -10 }}
          role="presentation"
        />);
      }
    }
    return <div />;
  },
})));

export const benchmarksColumns = (match) => {
  const cols = [
    heroTdColumn,
  ];
  if (match.players && match.players[0] && match.players[0].benchmarks) {
    Object.keys(match.players[0].benchmarks).forEach((key, i) => {
      cols.push({
        displayName: key,
        field: 'benchmarks',
        index: i,
        width: 2,
        displayFn: (row, column, field) => {
          if (field) {
            const bm = field[key];
            return (<div>
              <span>{`${Number(bm.pct * 100).toFixed(2)}%`}</span>
              <span>{bm.raw.toFixed(2)}</span>
            </div>);
          }
          return null;
        },
      });
    });
  }
  return cols;
};

export const purchaseTimesColumns = (match) => {
  const cols = [heroTdColumn];
  const bucket = 300;
  for (let i = 0; i < match.duration + bucket; i += bucket) {
    const curTime = i;
    cols.push({
      displayName: `${curTime / 60}'`,
      field: 'purchase_log',

      displayFn: (row, column, field) => (<div>
        {field ? field
        .filter(p => (p.time >= curTime - bucket && p.time < curTime))
        .map((p, i) => {
          if (items[p.key]) {
            return (
              <span key={i} style={{ float: 'left', fontSize: '11px' }}>
                <img src={`${API_HOST}/apps/dota2/images/items/${p.key}_lg.png`} role="presentation" style={{ height: '20px' }} />
                <br />
                <span>{formatSeconds(p.time)}</span>
              </span>);
          }
          return <span />;
        }) : ''}
      </div>),
    });
  }
  return cols;
};

export const lastHitsTimesColumns = (match) => {
  const cols = [heroTdColumn];
  const bucket = 300;
  for (let i = 0; i < match.duration + bucket; i += bucket) {
    const curTime = i;
    cols.push({
      displayName: `${curTime / 60}'`,
      field: 'lh_t',

      displayFn: (row, column, field) => (<div>
        {field ? field[curTime / 60] : ''}
      </div>),
    });
  }
  return cols;
};

export const overallColumns = [
  heroTdColumn, {
    displayName: 'Stacked',
    field: 'camps_stacked',

    sortFn: true,
  }, {
    displayName: 'Multikill',
    field: 'multi_kills_max',

    sortFn: true,
  }, {
    displayName: 'Streak',
    field: 'kill_streaks_max',

    sortFn: true,
  }, {
    displayName: 'Stuns',
    field: 'stuns',

    sortFn: true,
  }, {
    displayName: 'Dead',
    field: 'life_state_dead',

    sortFn: true,
  }, {
    displayName: 'Biggest Hit',
    field: 'max_hero_hit',

    sortFn: true,
    displayFn: (row, column, field) => {
      if (field) {
        // TODO use abilities if we need the full info immediately
        const ability = abilityKeys[field.inflictor];
        const item = items[field.inflictor];
        const hero = heroNames[field.key] || {};
        let props = {
          src: null,
          title: null,
        };
        if (ability) {
          props = {
            src: `${API_HOST}/apps/dota2/images/abilities/${field.inflictor}_lg.png`,
          };
        } else if (item) {
          props = {
            src: `${API_HOST}/apps/dota2/images/items/${field.inflictor}_lg.png`,
          };
        } else {
          props = {
            src: `${API_HOST}/public/images/default_attack.png`,
          };
        }
        return (<div>
          <img src={props.src} className={styles.imgSmall} role="presentation" />
          <div>{field.value}</div>
          <img src={`${API_HOST}${hero.img}`} className={styles.imgSmall} role="presentation" />
        </div>);
      }
      return <div />;
    },
  },
];

export const laningColumns = [
  heroTdColumn, {
    displayName: 'Lane',
    field: '',

    sortFn: true,
  }, {
    displayName: 'EFF@10',
    field: 'lane_efficiency',

    sortFn: true,
    displayFn: (row, col, field) => (field ? field.toFixed(2) : ''),
  }, {
    displayName: 'LH@10',
    field: 'lh_t',

    sortFn: true,
    displayFn: (row, col, field) => (field ? field[10] : ''),
  }, {
    displayName: 'DN@10',
    field: 'dn_t',

    sortFn: true,
    displayFn: (row, col, field) => (field ? field[10] : ''),
  },
];

export const purchaseColumns = [
  heroTdColumn, {
    displayName: 'TP',
    tooltip: strings.purchase_tpscroll,
    field: 'purchase',

    sortFn: true,
    displayFn: (row, col, field) => (field ? field.tpscroll : '-'),
  }, {
    displayName: 'Observers',
    tooltip: strings.purchase_ward_observer,
    field: 'purchase',

    sortFn: true,
    displayFn: (row, col, field) => (field ? field.ward_observer : '-'),
  }, {
    displayName: 'Sentries',
    tooltip: strings.purchase_ward_sentry,
    field: 'purchase',

    sortFn: true,
    displayFn: (row, col, field) => (field ? field.ward_sentry : '-'),
  }, {
    displayName: 'Smokes',
    tooltip: strings.purchase_smoke_of_deceit,
    field: 'purchase',

    sortFn: true,
    displayFn: (row, col, field) => (field ? field.smoke_of_deceit : '-'),
  }, {
    displayName: 'Dusts',
    tooltip: strings.purchase_dust,
    field: 'purchase',

    sortFn: true,
    displayFn: (row, col, field) => (field ? field.dust : '-'),
  }, {
    displayName: 'Gems',
    tooltip: strings.purchase_gem,
    field: 'purchase',

    sortFn: true,
    displayFn: (row, col, field) => (field ? field.gem : '-'),
  }, {
    displayName: 'Rapiers',
    tooltip: strings.purchase_rapier,
    field: 'purchase',

    sortFn: true,
    displayFn: (row, col, field) => (field ? field.rapier : '-'),
  },
];

export const chatColumns = [
  heroTdColumn, {
    displayName: 'Time',
    field: 'time',
    displayFn: (row, col, field) => formatSeconds(field),
  }, {
    displayName: 'Message',
    field: 'key',
  },
];

export const abilityUseColumns = [{
  displayName: 'Ability',
  field: 'name',
}, {
  displayName: 'Casts',
  field: 'ability_uses',
}, {
  displayName: 'Hits',
  field: 'hero_hits',
}, {
  displayName: 'Damage',
  field: 'damage_inflictor',
}];

export const itemUseColumns = [{
  displayName: 'Item',
  field: 'name',
}, {
  displayName: 'Casts',
  field: 'item_uses',
}, {
  displayName: 'Hits',
  field: 'hero_hits',
}, {
  displayName: 'Damage',
  field: 'damage_inflictor',
}];

export const unitKillsColumns = [
  heroTdColumn, {
    displayName: 'Heroes',
    tooltip: strings.farm_heroes,
    field: 'hero_kills',
    sortFn: true,
  }, {
    displayName: 'Creeps',
    tooltip: strings.farm_creeps,
    field: 'lane_kills',
    sortFn: true,
  }, {
    displayName: 'Neutrals',
    tooltip: strings.farm_neutrals,
    field: 'neutral_kills',
    sortFn: true,
  }, {
    displayName: 'Ancients',
    tooltip: strings.farm_ancients,
    field: 'ancient_kills',
    sortFn: true,
  }, {
    displayName: 'Towers',
    tooltip: strings.farm_towers,
    field: 'tower_kills',
    sortFn: true,
  }, {
    displayName: 'Couriers',
    tooltip: strings.farm_couriers,
    field: 'courier_kills',
    sortFn: true,
  }, {
    displayName: 'Roshans',
    tooltip: strings.farm_roshan,
    field: 'roshan_kills',
    sortFn: true,
  }, {
    displayName: 'Necronomicons',
    tooltip: strings.farm_necronomicon,
    field: 'necronomicon_kills',
    sortFn: true,
  }, {
    displayName: 'Other',
    field: 'specific',
    displayFn: (row, col, field) => JSON.stringify(field),
  },
];

export const actionsColumns = [heroTdColumn, {
  displayName: strings.abbr_actions_per_min,
  tooltip: strings.actions_per_min,
  field: 'actions_per_min',
}, {
  displayName: strings.abbr_pings,
  tooltip: strings.pings,
  field: 'pings',
}]
  .concat(Object.keys(orderTypes).filter(o => orderTypes[o] in strings).map(k => ({
    displayName: strings[`abbr_${orderTypes[k]}`],
    tooltip: strings[orderTypes[k]],
    field: 'actions',
    displayFn: (row, col, field) => (field ? field[k] : '-'),
  })));

export const runesColumns = [heroTdColumn]
  .concat(Object.keys(runes).map(k => ({
    displayName: strings[`rune_${k}`],
    field: 'runes',
    displayFn: (row, col, field) => (field ? field[k] : '-'),
  })));

export const cosmeticsColumns = [heroTdColumn, {
  displayName: 'Cosmetics',
  field: 'cosmetics',
  displayFn: (row, col, field) => field.map((c, i) => (
    <div key={i}>
      <img src={`http://cdn.dota2.com/apps/570/${c.image_path}`} style={{ height: '40px' }} role="presentation" />
      <div>{c.name}</div>
    </div>)),
}];

export const goldReasonsColumns = [heroTdColumn]
  .concat(Object.keys(strings)
    .filter(str => str.indexOf('gold_reasons_') === 0)
    .map(gr => ({
      displayName: strings[gr],
      field: 'gold_reasons',
      displayFn: (row, col, field) => (field ? field[gr.substring('gold_reasons_'.length)] : '-'),
    })));

export const xpReasonsColumns = [heroTdColumn]
  .concat(Object.keys(strings)
    .filter(str => str.indexOf('xp_reasons_') === 0)
    .map(gr => ({
      displayName: strings[gr],
      field: 'xp_reasons',
      displayFn: (row, col, field) => (field ? field[gr.substring('xp_reasons_'.length)] : '-'),
    })));

export const objectiveDamageColumns = [heroTdColumn]
  .concat(Object.keys(strings).filter(str => str.indexOf('objective_') === 0)
    .map(obj => ({
      displayName: strings[obj],
      field: 'objective_damage',
      displayFn: (row, col, field) => (field ? field[obj.substring('objective_'.length)] : '-'),
    })));

export const logColumns = [heroTdColumn, {
  displayName: 'Time',
  field: 'time',
  displayFn: (row, col, field) => formatSeconds(field),
}, {
  displayName: 'Type',
  field: 'type',
}, {
  displayName: 'Target',
  field: 'objective',
}];


export const analysisColumns = [heroTdColumn, {
  displayName: 'Analysis',
  field: 'analysis',
  displayFn: (row, col, field) => (
    Object.keys(field).map(f => (
      <div>
        <span>{field[f].pct}</span>
        <span>{field[f].display}</span>
      </div>
    ))
  ),
}];

export const teamfightColumns = [
  heroTdColumn, {
    displayName: 'Died',
    field: 'deaths',
  }, {
    displayName: 'Damage',
    field: 'damage',
  }, {
    displayName: 'Healing',
    field: 'healing',
  }, {
    displayName: 'Gold',
    field: 'gold_delta',
  }, {
    displayName: 'XP',
    field: 'xp_delta',
  }, {
    displayName: 'Abilities',
    field: 'ability_uses',
    displayFn: (row, col, field) => (field ? Object.keys(field).map((k, i) => {
      if (abilityKeys[k]) {
        return (<span key={i}>
          <img src={`${API_HOST}/apps/dota2/images/abilities/${k}_lg.png`} role="presentation" style={{ height: '20px' }} />
        </span>);
      }
      return <div />;
    }) : ''),
  }, {
    displayName: 'Items',
    field: 'item_uses',
    displayFn: (row, col, field) => (field ? Object.keys(field).map((k, i) => {
      if (items[k]) {
        return (<span key={i}>
          <img src={`${API_HOST}/apps/dota2/images/items/${k}_lg.png`} role="presentation" style={{ height: '20px' }} />
        </span>);
      }
      return <div />;
    }) : ''),
  },
];

// TODO
// party indicator
// Damage inflictors dealt/received
// Lane map
// Ward maps
