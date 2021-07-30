import React, {useState, useEffect, useRef} from 'react'

function TodoForm(props) {

	const [input,setInput] = useState(props.edit ? props.edit.value : '')

	const inputRef = useRef(null)

	useEffect(() => {
		inputRef.current.focus()
	})

	/**
	 * [On change, changes the text input valeu]
	 * @param  {[Object]} e [Dom Events]
	 * @return {[Void]}
	 */
	const handleChange = e => {
		setInput(e.target.value);
	}

	/**
	 * [On submit, prepares the task data, giving a default id and status, and placing its text]
	 * @param  {[Object]} event [Dom Events]
	 * @return {[Void]}
	 */
	const handleSubmit = async (event) => {
		event.preventDefault();
		let taskData = {
			id:1,
			text: input,
			isComplete: false //0 - open 1 - finished
		};
		props.onSubmit(taskData)

		setInput('')
	};

	return (
		<form className='todo-form' onSubmit={handleSubmit}>
			{!props.edit ?
				(<><input type='text' placeholder='Add a todo' value={input} name='text' className='todo-input' onChange={handleChange} ref={inputRef}/>
				 <button className='todo-button'>Add todo</button></>) :
				 (<><input type='text' placeholder='Update your item' value={input} name='text' className='todo-input edit' onChange={handleChange} ref={inputRef}/>
				 <button className='todo-button edit'>Update</button></>)}
			
		</form>
	)
}

export default TodoForm