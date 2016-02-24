import Rx from 'rxjs/Rx';
import Immutable from 'immutable';
import createInitialRealizer from './virtualDomRealizer';
import renderMarbles from './visual';

export { default as Rx } from 'rxjs/Rx';

function observationUpdater(appState,{streamId,observation,timestamp}){
  const newObservable = Immutable.Map({streamName:streamId,observations:Immutable.List()})

  return appState.update( streamId, newObservable, function(observable){
    return observable.update('observations', (obs)=> obs.push({timestamp,value:observation}));
  });
}

function realizeAppState( realizer, appState ){
  const newTree = renderMarbles(appState.toJSON());
  const nextRealizer = realizer(newTree);
  return nextRealizer;
}

export function createMarbleDisplay(containerElement){

  let observations = new Rx.Subject(); 

  function recordObservation(streamId,observation){
    observations.next({streamId,observation,timestamp:Date.now()});
  }

  const initialAppState = Immutable.Map();
  const appStates = observations.scan( observationUpdater, initialAppState );

  const animationFrames = Rx.Observable.interval(50);
  const stateFrames = animationFrames.withLatestFrom(appStates,(_,appState)=> appState);


  const initialRealizer = createInitialRealizer(containerElement);
  const realizerStream = stateFrames.scan( realizeAppState, initialRealizer );

  // Need something to pull values through. 
  // TODO: How am I supposed to do this the Rx Way?
  realizerStream.subscribe( ()=>{} )

  return recordObservation;
}
