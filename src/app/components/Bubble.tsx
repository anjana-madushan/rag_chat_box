import React from 'react'

const Bubble = ({ message }) => {

  const { content, role } = message;
  return (
    <div className={`${role} bubble`}>Bubble</div>
  )
}

export default Bubble