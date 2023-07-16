import {EffectInstance, effekseerManager} from "../../r3f-effekseer";

export function EffectButtons({effectNames}: { effectNames: string[] }) {
  return (
    <div className="absolute bottom-0 left-0">
      {effectNames.map((name, i) =>
        <EffectButton effectPlayer={new EffectInstance(name, effekseerManager.effects[name], effekseerManager)}
                      key={i}/>
      )}
    </div>
  )
}


export function EffectButton({effectPlayer}: { effectPlayer: EffectInstance }) {
  return (
    <button className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-full m-2"
            onClick={() => {
              effectPlayer.setPosition(-15, 0, 0);
              effectPlayer.play()
            }}>
      {effectPlayer.name}
    </button>
  )
}