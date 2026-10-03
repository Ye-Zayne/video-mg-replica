import {Composition, registerRoot} from 'remotion';
import {Replica} from './Replica';
import {config} from './config';
const Root = () => <Composition id="Replica" component={Replica} {...config}
  defaultProps={{motionEnabled: true, stillFrame: 90, title: '把每一帧，\n变成可编辑。', accent: '#f6a75b'}} />;
registerRoot(Root);
