import {useContext} from "react";
import {EffekseerReactContext} from "../effects/EffectContext";


export function EffectButtons({effects}: { effects: string[] }) {
  const {effectNames} = useContext(EffekseerReactContext)

  return (
    <div className="absolute bottom-0 left-0">
      {effectNames.map((effectName, i) =>
        <EffectButton name={effectName} key={i}/>
      )}
    </div>
  )
}


export function EffectButton({name}: { name: string }) {
  return (
    <button className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-full m-2"
            onClick={() => {}}>
      {name}
    </button>
  )
}