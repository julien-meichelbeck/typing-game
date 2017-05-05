import React from 'react'
import 'isomorphic-fetch'
import { connect } from 'react-redux'
import recompact from 'shared/modules/recompact'
import { createGame, joinGame, leaveGame, sendPlayerProgress } from 'shared/action/games'
import { gameRoute } from 'shared/routes'
import { wordsPerMinute, absoluteUrl } from 'shared/utils'
import WaitingRoom from 'client/component/page/game/WaitingRoom'
import Countdown from 'client/component/page/game/Countdown'
import Word from '../Word'
import Player from '../Player'

export default recompact.compose(
  recompact.withState('status', 'setStatus', 'idle'),
  recompact.withState('wordInput', 'setWordInput', ''),
  recompact.withState('index', 'setIndex', 0),
  recompact.withState('startTime', 'setStartTime', null),
  connect(
    ({ game: gameState, account }, { game }) => ({
      game: { ...game, ...gameState },
      account,
    }),
    dispatch => ({ dispatch }),
  ),
  recompact.branch(
    ({ account }) => !account || !account.username,
    () => () => <div>You must login!</div>,
  ),
  recompact.lifecycle({
    componentWillMount() {
      const { game, dispatch } = this.props
      if (game && game.id && game.text) return
      dispatch(createGame())
    },
    componentDidUpdate() {
      const { game, dispatch } = this.props
      if (game && game.id && game.text) return
      dispatch(createGame())
    },
  }),
  recompact.branch(({ game }) => !game || !game.id, () => () => <div>Loading</div>),
  recompact.withProps(({ game: { text } }) => ({
    words: text.split(' '),
  })),
  recompact.lifecycle({
    componentWillMount() {
      const { account, game: { id: gameId }, dispatch } = this.props
      dispatch(joinGame({ player: account, gameId }))
    },
    componentWillUnmount() {
      const { account, game: { id: gameId }, dispatch } = this.props
      dispatch(leaveGame({ player: account, gameId }))
    },
  }),
  WaitingRoom,
  Countdown,
  recompact.withHandlers({
    onWordInputChange: ({
      setWordInput,
      words,
      index,
      setIndex,
      startTime,
      setStartTime,
      setStatus,
      game,
      dispatch,
      account,
    }) => ({ target: { value } }) => {
      if (!startTime) {
        setStartTime(Date.now())
        setStatus('playing')
      }
      const isWordWithSpace = `${words[index]} ` === value
      const isLastWord = index + 1 === words.length && words[index] === value
      if (isWordWithSpace || isLastWord) {
        dispatch(sendPlayerProgress({
          player: {
            id: account.id,
            username: account.username,
            progress: index + 1,
            speed: wordsPerMinute(startTime, words, index),
          },
          gameId: game.id,
        }))
        if (isWordWithSpace) {
          setWordInput('')
          setIndex(index + 1)
        } else if (isLastWord) {
          setWordInput('')
          setStatus('done')
        }
      } else {
        setWordInput(value)
      }
    },
  }),
)(({
  game: { players, id },
  account,
  words,
  wordInput,
  onWordInputChange,
  index,
  status,
  countdown,
}) => {
  const isGameReady = countdown < 1
  const isCorrectWord = !wordInput.length
    || words[index].substring(0, wordInput.length) === wordInput
  return (
    <div>
      { !isGameReady ? countdown : null }
      { players.map(player =>
        <Player
          key={player.id}
          progressValue={player.progress}
          progressMax={words.length}
          {...player}
        />)
      }
      <p style={{ fontSize: '24px' }}>
        {
          words.map((word, i) =>
            <Word
              key={word + i}
              isCurrentWord={i === index && status !== 'done'}
              isCorrect={isCorrectWord}
              blurry={!isGameReady}
              isBeingWritten={
                players
                  .filter(({ id }) => id !== account.id)
                  .some(({ progress }) => progress === i)
              }
            >
              {word}
            </Word>,
          )
        }
      </p>
      <input
        type="text"
        style={{
          height: '50px',
          width: '100%',
          fontSize: '30px',
          color: isCorrectWord ? 'black' : 'red',
        }}
        autoFocus
        value={wordInput}
        onChange={isGameReady ? onWordInputChange : null}
      />
      <br />
      <p>{'Play with your friends!'}</p>
      <input
        readOnly
        value={absoluteUrl(gameRoute(id))}
        style={{ width: '100%', fontSize: '20px' }}
      />
    </div>
  )
})
