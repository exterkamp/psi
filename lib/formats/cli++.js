'use strict';
const _ = require('lodash');
const chalk = require('chalk');
const utils = require('../utils');

module.exports = (overview, sections) => {
  const renderOverview = item => {
    const color = (item.label === 'Speed' || item.label === 'Usability') ? utils.scoreColor(item.value) : chalk.cyan;
    return item.label + ':' + utils.buffer(item.label, 11) + color(item.value);
  };

  const renderSection = item => utils.labelize(item.label) + chalk.cyan(item.value);

  const ret = [
    utils.divider,
    _.map(overview, renderOverview).join('\n') + '\n',
  ]

  sections.forEach(section => {
    ret.push(section.title);
    ret.push(utils.thinDivider);
    ret.push(_.map(section.content, renderSection).join('\n') + '\n',);
  });

  ret.push(utils.divider);

  return ret.join('\n');
};