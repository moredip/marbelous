import _ from 'underscore';
import d3 from 'd3';
import h from 'virtual-dom/virtual-hyperscript';
import svg from 'virtual-dom/virtual-hyperscript/svg';

/** @jsx jsxToHyperscriptAdapter */
function jsxToHyperscriptAdapter(name,props,...children){
  if( _.contains(['svg','g','circle','text','line'],name) ){
    return svg(name,props,children);
  }else{
    return h(name,props,children);
  }
}

const CIRCLE_STYLE = {fill:"#ddd",stroke:"#999", strokeWidth:"2px"},
      MARBLE_TEXT_PROPS = { 'alignment-baseline': 'middle', 'text-anchor':'middle' },
      CIRCLE_RADIUS = 30,
      VERT_PADDING = 8,
      FULL_HEIGHT = (CIRCLE_RADIUS*2) + (VERT_PADDING*2),
      HORZ_PADDING = 40,
      TIME_RANGE = 1000*10; // 10 seconds
      
function renderMarbleSvg({transform,opacity,value,circleModifierClass}){
  const circleClass = `marbelous-marble ${circleModifierClass}`;

  return <g transform={transform} opacity={opacity}>
    <circle class={circleClass} r={CIRCLE_RADIUS}></circle>
    <text class="marbelous-marble__text" {...MARBLE_TEXT_PROPS}>
      {JSON.stringify(value)}
    </text>
  </g>;
}

function renderMarble({observation,timescale}){
  const x = timescale(observation.timestamp);

  // don't render things that are way off-scene
  if( x < -100 ){
    return undefined;
  }

  const fadescale = timescale.copy().range([0.1,1])
  const opacity = fadescale(observation.timestamp);
  const transform = `translate(${x},0)`;

  return renderMarbleSvg({transform,opacity,value:observation.value});
}

function renderLatestValueMarble(observation,xOffset){
  const transform = `translate(${xOffset},0)`;

  return renderMarbleSvg({transform,circleModifierClass:"-curr-value",value:observation.value});
}

function latestValueFrom(observable){
  return _.last( observable.observations );
}

function renderObservableLine({width,observable,timescale}){
  const vertOffset = (FULL_HEIGHT/2);
  const marbles = _.compact( observable.observations.map( function(observation){
    return renderMarble({observation,timescale});
  }));
  const latestValueMarble = renderLatestValueMarble( 
      latestValueFrom(observable),
      timescale.range()[1]
      );
  
  const transform = `translate(0,${vertOffset})`;
  return <section className="marbelous-stream">
    <h2 className="marbelous-stream__name">{observable.streamName}</h2>
    <svg width={width} height={FULL_HEIGHT}>
    <g transform={transform}>
    <line class="marbelous-stream__line" x1="0" x2={width-HORZ_PADDING} y1="0" y2="0"/>
    {latestValueMarble}
    {marbles}
  </g>
  </svg>
  </section>;
}

export default function render(observables){
  const width = document.body.clientWidth - 50; // hacky, but good enough.
  const now = Date.now();
  const timeRange = [now - TIME_RANGE,now];
  const timescale = d3.time.scale()
      .domain(timeRange)
      .range([HORZ_PADDING,width-HORZ_PADDING]);

  const lines = _.values(observables).map(function(observable){
    return renderObservableLine({width,observable,timescale});
  });

  return <section>
      {lines}
    </section>;
}
