import {Composition, registerRoot} from 'remotion';
import {Replica} from './Replica';
import {config} from './config';
const Root=()=> <Composition id="Replica" component={Replica} {...config} defaultProps={{motionEnabled:true,stillFrame:98,title:'',accent:'#d3f023',words:{},assetOverrides:{},audioEnabled:true}}/>;
registerRoot(Root);
