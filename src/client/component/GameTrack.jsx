import React from 'react'
import injectSheet from 'react-jss'
import Player from 'client/component/Player'
import Container from 'client/component/Container'
import Button from 'client/component/Button'
import recompact from 'shared/modules/recompact'

const COLORS = [
  'rgb(170, 111, 252)',
  'rgb(135, 255, 59)',
  'rgb(250, 113, 97)',
  'rgb(237, 241, 120)',
  'rgb(43, 255, 234)',
  'rgb(210, 0, 142)',
]

const styles = {
  root: {
    width: '100vw',
    position: 'relative',
    left: '50%',
    right: '50%',
    marginLeft: '-50vw',
    marginRight: '-50vw',
    minHeight: '200px',
    padding: '14px',
    background: 'rgb(38, 31, 66)',
    color: 'white',
  },
}

export default recompact.compose(
  injectSheet(styles),
  recompact.withState('showShareUrl', 'setShowShareUrl', false),
)(({
  players,
  words,
  classes,
  gameUrl,
  showShareUrl,
  setShowShareUrl,
}) => {
  const finishedPlayers = players
    .filter(player => player.status === 'done')
    .sort((pA, pB) => pA.time - pB.time)
  return (
    <div className={classes.root}>
      <Container>
        {
          players.map((player, index) =>
            <Player
              key={player.id}
              otherPlayers={players}
              progressValue={player.progress}
              progressMax={words.length}
              position={finishedPlayers.findIndex(({ id }) => player.id === id) + 1}
              color={COLORS[index]}
              {...player}
            />)
        }
        <Button dark onClick={() => setShowShareUrl(!showShareUrl)}>Add a player</Button>
        {
          showShareUrl
            ? <div>
              <p>{'Play with your friends!'}</p>
              <input
                readOnly
                value={gameUrl}
                style={{ width: '100%', fontSize: '20px' }}
              />
            </div>
            : null
        }
      </Container>
    </div>
  )
})
