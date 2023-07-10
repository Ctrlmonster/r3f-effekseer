import {simulation} from "../components/SceneContainer";


export function EffectButtons({effects}: { effects: string[] }) {
  return (
    <div className="absolute bottom-0 left-0">
      {effects.map((effectName, i) =>
        <EffectButton name={effectName} key={i}/>
      )}
    </div>
  )
}


export function EffectButton({name}: { name: string }) {
  return (
    <button className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-full m-2"
            onClick={() => simulation.playEffect(name)}>
      {name}
    </button>
  )
}