<script lang="ts">
    import { paddleLeft, xScale, yScale } from './GameView.js';

    export let top: number;
    export let height: number;
    export let width: number;

    const paddleRadius = 5;
</script>
  

<rect
    id='paddle'
    x={$xScale($paddleLeft)}
    y={$yScale(top)}
    width={$xScale(width)}
    height={$yScale(height)}
    rx={$xScale(paddleRadius)}
    ry={$yScale(paddleRadius)}
></rect>


<style>
    #paddle {
        fill: coral;
        cursor: pointer;
    }
</style>
  