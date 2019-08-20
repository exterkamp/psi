'use strict';
const fs = require('fs');
const querystring = require('querystring');
const download = require('download');
const prettyBytes = require('pretty-bytes');
const sortOn = require('sort-on');
const humanizeUrl = require('humanize-url');

const THRESHOLD = 70;
const RESOURCE_URL = 'https://developers.google.com/speed/pagespeed/insights/optimizeContents?';

function overview(url, strategy, perfScore) {
  const ret = [];

  ret.push({
    label: 'URL',
    value: url
  });

  ret.push({
    label: 'Strategy',
    value: strategy
  });

  ret.push({
    label: 'Speed',
    value: perfScore
  });

  return ret;
}

function ruleSetResults(rulesets) {
  const ret = [];

  for (const title in rulesets) {
    if (Object.prototype.hasOwnProperty.call(rulesets, title)) {
      ret.push({
        label: title,
        value: Math.ceil(rulesets[title].ruleImpact * 100) / 100
      });
    }
  }

  return sortOn(ret, 'label');
}

function statistics(stats) {
  const ret = [];

  stats.forEach(element => {
    ret.push({
      label: element.title,
      value: element.displayValue,
    });
  });

  return sortOn(ret, 'label');
}

function cruxData(data) {
  const ret = [];
  if (!data || !data.metrics) return ret;

  for (const [key, value] of Object.entries(data.metrics)) {
    ret.push({
      label: key,
      value: value.category,
    });
  }

  return ret
}

function getReporter(format) {
  format = 'cli++';
  return require(`./formats/${format}`);
}

module.exports = (parameters, response) => {
  return Promise.resolve().then(() => {
    const renderer = getReporter(parameters.format);

    const lhr = response.lighthouseResult;
    const url = lhr.finalUrl;
    const audits = lhr.audits;

    const pageCrux = cruxData(response.loadingExperience);
    const originCrux = cruxData(response.originLoadingExperience);

    const sections = [
      {
        title: 'Performance Metrics',
        content: statistics([audits['first-contentful-paint'], audits['speed-index'], audits['interactive'], audits['first-meaningful-paint'], audits['first-cpu-idle'], audits['max-potential-fid']]),
      }];
    
    if (!!pageCrux.length) {
      sections.push(
        {
          title: 'Page Loading Experience',
          content: pageCrux,
        });
    }

    if (!!originCrux.length) {
      sections.push(
        {
          title: 'Origin Loading Experience',
          content: originCrux,
        });
    }

    console.log(renderer(
      overview(humanizeUrl(url), parameters.strategy, lhr.categories.performance.score * 100),
      sections,
    ));
  });
};
