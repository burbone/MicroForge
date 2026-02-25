import { h } from 'preact';
import LeftPanel from './components/LeftPanel';
import FeaturesPanel from './components/FeaturesPanel';
import RightPanel from './components/RightPanel';
import BottomBar from './components/BottomBar';

export default function App() {
  return (
    <div className="container">
      <LeftPanel />
      <FeaturesPanel />
      <RightPanel />
      <BottomBar />
    </div>
  );
}