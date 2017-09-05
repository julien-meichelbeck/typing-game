import React from 'react'
import recompact from 'shared/modules/recompact'
import GameText from 'client/component/GameText'
import GameTrack from 'client/component/GameTrack'
import GameInput from 'client/component/GameInput'
import { joinGame, leaveGame } from 'client/socketApi'
import { gameState$ } from 'client/socket'
import ReadyCheck from 'client/component/ReadyCheck'
import provideObs from './Game.obs'

export default recompact.compose(
  recompact.setDisplayName('Game'),
  recompact.lifecycle({
    componentWillMount() {
      joinGame(this.props.gameId)
    },
    componentWillUnmount() {
      leaveGame(this.props.gameId)
    },
  }),
  // recompact.connectObs(({ reload$ }) => ({
  //   key: reload$.scan(reloadCount => reloadCount + 1, 0),
  // })),
  recompact.connectObs(() => ({ gameState: gameState$ })),
  recompact.branch(({ gameState }) => !gameState, recompact.renderNothing),
  recompact.withObs(provideObs),
  recompact.pluckObs(['currentPlayer$']),
)(({ currentPlayer }) => (
  <div style={{ width: '100%' }}>
    <GameTrack />
    {currentPlayer.status === 'waiting' ? (
      <ReadyCheck />
    ) : (
      <div>
        <GameText />
        <GameInput />
      </div>
    )}
  </div>
))