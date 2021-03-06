import chai, {should} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import 'babel-polyfill';
import log from '../src/components/log/log';

log.disableLog();

jest.mock('react-native', () => {
  return require('./mocks/react-native');
});

jest.mock('react-addons-test-utils', () => {
  return require('react-dom/test-utils');
});

// eslint-ignore-next-line
const chaiEnzyme = require('chai-enzyme');

chai.use(chaiEnzyme());
chai.use(chaiAsPromised);
chai.use(sinonChai);
should();

//Fixes https://github.com/sinonjs/sinon/issues/1051
global.location = {host: 'localhost', protocol: 'http'};
