import {Composition, registerRoot} from 'remotion';
import {Replica} from './Replica';
import {config} from './config';

const Root = () => <Composition id="Replica" component={Replica} {...config}
  defaultProps={{motionEnabled: true, stillFrame: 60, title: '', accent: '#6657ff'}} />;
registerRoot(Root);
