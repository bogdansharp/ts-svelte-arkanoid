<script lang="ts">
    import { mainTitle, coefX, coefY } from './GameView.js';

    export let xPos: number;
    export let yPos: number;

    // import { scaleLinear } from 'd3';
    // export let xScale: scaleLinear;
    // export let yScale: scaleLinear;
    // const xPos = 40;
    // const xPos = 15;
    // $: xRatio = xScale.domain()[1] ? xScale.range()[1] / xScale.domain()[1] : 1;
    // $: yRatio = yScale.domain()[1] ? yScale.range()[1] / yScale.domain()[1] : 1;
    // <text 
    //     id="status"
    //     class="msg-ok unselectable"
    //     x={xScale.domain()[1] - xScale(xPos)} 
    //     y={yScale.domain()[1] - yScale(yPos)} 
    //     text-anchor='end'
    //     transform={`scale(${xRatio}, ${yRatio})`}
    // >
    //     {$mainTitle}
    // </text>
</script>


<text 
    id="status"
    class="msg-ok unselectable"
    x={xPos} 
    y={yPos} 
    text-anchor='end'
    transform={`scale(${$coefX}, ${$coefY})`}
>
    {$mainTitle}
</text>


<style>
    #status {
        opacity: 0.9;
        font-family: Verdana, Geneva, Tahoma, sans-serif;
    }
</style>
  