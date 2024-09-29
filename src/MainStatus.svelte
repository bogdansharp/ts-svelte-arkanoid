<script lang="ts">
    export let text: string;
    export let classes: string;
</script>
  

<div id="mainstatus" class={`unselectable ${classes}`}> 
    {text}
</div>


<style>
    #mainstatus {
        position: absolute;
        text-align: center;
        font-size: x-large;
        font-weight: bold;
        z-index: 4;
        left: 0px;
        width: 100%;
        top: 40%;
        font-family: Verdana, Geneva, Tahoma, sans-serif;
        /*display: none;*/
    }
</style>
  