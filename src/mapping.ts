import { BigInt, log, store } from "@graphprotocol/graph-ts"
import {
  CycleFinished,
  UpdatedOwner,
  WinnerChanged,
  FlyAdded,
  Entered,
  Exited
  
} from "../generated/FattestTadpole/FattestTadpole"
import { CurrentCycle, Cycle, Competitor } from "../generated/schema"

export function handleCycleFinished(event: CycleFinished): void {
  IncrementCurrentCycle();
}

export function handleFlyAdded(event: FlyAdded ): void {
  const cycle = getOrCreateCurrentCycle().cycle;
  const userId = event.transaction.from.toHex() + '_' + cycle.toString();
  let user = Competitor.load(userId);
  if(!user){ // user didnt move his tadpole for the next cycle but added FLY
    user = new Competitor(userId); 
    user.burnedCurrentCycle = BigInt.zero();
    user.cycleNumber = cycle;
    user.cycle = cycle.toString();
    user.address = event.transaction.from;
    user.stakedTadpole = event.params.tokenId.toI32();
  }
  user.burnedCurrentCycle = user.burnedCurrentCycle.plus(event.params.amount);
  user.save();

}

export function handleEntered(event: Entered ): void {
  const cycle = getOrCreateCurrentCycle().cycle;
  const userId = event.transaction.from.toHex() + '_' + cycle.toString();
  let user = Competitor.load(userId);
  if(!user){
    user = new Competitor(userId);
  }
  // enter -> exit case  
  user.burnedCurrentCycle = BigInt.zero();
  user.cycleNumber = cycle;
  user.cycle = cycle.toString();
  user.address = event.transaction.from;
  user.stakedTadpole = event.params.tokenId.toI32();
  user.save();

}

export function handleExited(event: Exited ): void {
  const cycle = getOrCreateCurrentCycle().cycle;
  const userId = event.transaction.from.toHex() + '_' + cycle.toString();
  let user = Competitor.load(userId);
  store.remove('Competitor',userId);

}

export function handleUpdatedOwner(event: UpdatedOwner): void {}

export function handleWinnerChanged(event: WinnerChanged): void {
  const currentCycle = getOrCreateCurrentCycle().cycle; 
  let cycle = Cycle.load(currentCycle.toString());
  if(!cycle){
    cycle = new Cycle(currentCycle.toString());
    cycle.cycle = currentCycle;
  }  
    
  cycle.currentWinner = event.params.winner.adr;
  cycle.currentWinnerPoints = event.params.winner.points;
  cycle.save();
  
}


function getOrCreateCurrentCycle(): CurrentCycle {
  let current = CurrentCycle.load("CurrentCycle");
  if(!current){
    current = new CurrentCycle("CurrentCycle");
    current.cycle = 1;
    current.save();
  }
  return current;
}

function IncrementCurrentCycle(): void {
  let current = CurrentCycle.load("CurrentCycle");
  if(current){
    current.cycle += 1;
    current.save();
  }
  else {
    current = new CurrentCycle("CurrentCycle");
    current.cycle = 1;
    current.save();
  }
}
