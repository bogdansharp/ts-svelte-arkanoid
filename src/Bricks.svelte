<script lang="ts">
    import GameModel from "./GameModel";
    import { bricksFrame, xScale, yScale } from './GameView';

    export let model: GameModel;

    let bricks = model.bricks;
    $: $bricksFrame, bricks = [...model.bricks]; // Refresh bricks when store is updated
</script>
  

<g id={'bricks'}>
{#each bricks as [x1, x2, y1, y2, id, type, color] (id)}
    <rect
        id={`brick-${id}`}
        x={$xScale(x1)}
        y={$yScale(y1)}
        width={$xScale(x2 - x1)}
        height={$yScale(y2 - y1)}
        rx={0}
        ry={0}
        stroke={'#000000'}
        fill={`#${color.toString(16).padStart(6, '0')}`}
    ></rect>
{/each}
</g>
  