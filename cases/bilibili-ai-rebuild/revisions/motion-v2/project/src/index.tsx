import {Composition,registerRoot} from 'remotion';
import {Replica} from './Replica';
import {config} from './config';
const Root=()=> <Composition id="Replica" component={Replica} {...config} defaultProps={{motionEnabled:true,stillFrame:960,bugCount:900,recordCount:17000,modelName:'GPT-5.6 Sol',brandName:'HUGGING FACE',accentFrom:'#44d3c8',accentTo:'#3c509b',motionSpeed:1,showSubtitles:true,showSourceCredit:true,sceneTitleOverrides:{}}}/>;
registerRoot(Root);
