import React, {useState, useEffect} from 'react'
import TodoForm from './TodoForm';
import Todo from './Todo';

import { ContentRecordDAC } from '@skynetlabs/content-record-library';
import { SkynetClient } from 'skynet-js';
const portal = window.location.hostname === 'localhost' ? 'https://siasky.net' : undefined;
const client = new SkynetClient(portal);
const contentRecord = new ContentRecordDAC();

function TodoList() {
	const [todos, setTodos] = useState([])
	const [userID, setUserID] = useState();
	const [mySky, setMySky] = useState();
	const [loggedIn, setLoggedIn] = useState(null);
	const dataDomain = 'localhost';

	/**
	 * [initMySky initiate the MySky and load existing tasks]
	 * @return {[void]}
	 */
	useEffect(() => {
		async function initMySky() {
			try {
				const mySky = await client.loadMySky(dataDomain);

				await mySky.loadDacs(contentRecord);

				const loggedIn = await mySky.checkLogin();

				setMySky(mySky);
				setLoggedIn(loggedIn);
				if (loggedIn) {
					setUserID(await mySky.userID());
				}

				let { data } = await mySky.getJSON("localhost/todoListFinal");
				let temp = []
				let count1 = Object.keys(data).length - 1
				let count2 = 0
				Object.keys(data).forEach(function(k){
				    temp[count1 - count2] = data[k]
				    count2++
				});
				setTodos(temp)
			} catch (e) {
				console.error(e);
			}
		}
		initMySky();
	}, []);

	/**
	 * [Adds tasks into the local todo list and call function to add into the mysky todo list]
	 * @param  {[Json]} todo [New task data (id:int, text:string, isComplete:boolean)]
	 * @return {[void]}
	 */
	const addTodo = todo => {
		if(!loggedIn){
			document
				.getElementById("login-button")
				.addEventListener("click", mySky.requestLoginAccess());
		}else{    	
			if(!todo.text || /^\s*$/.test(todo.text))
				return

			todo.id = todos.length>0?todos[0].id+1:1
			addMysk(todo)
			const newTodos = [todo, ...todos]
			setTodos(newTodos)
			console.log(newTodos)
		}			
	}

	/**
	 * [Adds task into the todo list on the mySky]
	 * @param  {[Json]} todo [New task data (id:int, text:string, isComplete:boolean)]
	 * @return {[Void]}
	 */
	const addMysk = async (taskData) => {		
		try {
			const { data } = await mySky.getJSON("localhost/todoListFinal");
			console.log(data)
			if(!data)
				await mySky.setJSON("localhost/todoListFinal", taskData);
			else{
				let tempData = data
				tempData[taskData.id] = taskData
				await mySky.setJSON("localhost/todoListFinal", tempData);
				const { newData } = await mySky.getJSON("localhost/todoListFinal");
				console.log(newData)
			}
		} catch (error) {
			console.log(`error with setJSON: ${error.message}`);
		}
	}

	/**
	 * [Marks the task as done, changing it on mySky too, but doesn't delete it]
	 * @param  {[Integer]} id [The task id]
	 * @return {[void]}
	 */
	const completeTodo = async (id) => {
		let { data } = await mySky.getJSON("localhost/todoListFinal");
		data[id].isComplete = !data[id].isComplete
		try {
			await mySky.setJSON("localhost/todoListFinal", data);
		} catch (error) {
			console.log(`error with setJSON: ${error.message}`);
		}
		let updatedTodos = todos.map(todo => {
			if(todo.id === id){
				todo.isComplete = !todo.isComplete
			}
			return todo
		})
		setTodos(updatedTodos)
	}


	/**
	 * [Delete the task from the list and from mySky]
	 * @param  {[Integer]} id [The task id]
	 * @return {[Void]}
	 */
	const removeTodo = async (id) => {
		const removeArr = [...todos].filter(todo => todo.id !== id)
		let { data } = await mySky.getJSON("localhost/todoListFinal");
		delete data[id]
		try {
			await mySky.setJSON("localhost/todoListFinal", data);
		} catch (error) {
			console.log(`error with setJSON: ${error.message}`);
		}

		setTodos(removeArr)
	}

	/**
	 * [description]
	 * @param  {[Integer]} todoId   [The task id]
	 * @param  {[Json]}    newValue [New task data (id:int, text:string, isComplete:boolean)]
	 * @return {[Void]}
	 */
	const updateTodo = async (todoId, newValue) => {
		if(!newValue.text || /^\s*$/.test(newValue.text))
			return

		let { data } = await mySky.getJSON("localhost/todoListFinal");
		data[todoId].text = newValue.text
		try {
			await mySky.setJSON("localhost/todoListFinal", data);
		} catch (error) {
			console.log(`error with setJSON: ${error.message}`);
		}

		setTodos(prev => prev.map(item =>(item.id === todoId ? newValue : item)))
	}

	return (
		<div>
			<button type="button" id="login-button" hidden>Login</button>
			<h1>What's up for Today?</h1>
			<TodoForm onSubmit={addTodo}/>
			<Todo todos={todos} completeTodo={completeTodo} removeTodo={removeTodo} updateTodo={updateTodo}/>
		</div>
	)
}

export default TodoList