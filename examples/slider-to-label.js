const recordObservation = Marbelous.createMarbleDisplay(document.getElementById('marbles-container'));

function visualize(name,observable) {
  observable.subscribe( e => recordObservation(name,e) );
}

function observeEventValues($el,eventName){
  return Rx.Observable.fromEvent($el, eventName)
    .map( (e)=> e.target.value );
}

const $slider = $('.slider input'),
      $label = $('.slider .label');

const values = observeEventValues($slider,'input').startWith($slider.val());
visualize('slider values',values);

const floats = values.map(parseFloat);
visualize('floats',floats);

const percents = floats.map( x => Math.round(x*100) );
visualize('percents',percents);

const formatted = percents.map( x => `${x}%` )
visualize('formatted',formatted);

formatted.subscribe( (x)=> $label.text(x) );
