import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'; // Changed import
import API from '../api';
import { Link } from 'react-router-dom';

const statuses = ['To Do', 'In Progress', 'Done'];

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: ''
  });

  const fetchTasks = async () => {
    const res = await API.get('/tasks');
    setTasks(res.data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post('/tasks', { ...formData, assignedTo: user.id, status: 'To Do' });
    setFormData({ title: '', description: '' });
    fetchTasks();
  };

  const handleDelete = async (id) => {
    await API.delete(`/tasks/${id}`);
    fetchTasks();
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    if (destination.droppableId !== source.droppableId) {
      await API.put(`/tasks/${draggableId}`, { status: destination.droppableId });
      fetchTasks();
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const [editTaskId, setEditTaskId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });

  const startEdit = (task) => {
    setEditTaskId(task._id);
    setEditForm({ title: task.title, description: task.description });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveEdit = async (id) => {
    await API.put(`/tasks/${id}`, editForm);
    setEditTaskId(null);
    fetchTasks();
  };

  const cancelEdit = () => {
    setEditTaskId(null);
  };

  const [searchQuery, setSearchQuery] = useState('');




  return (
    
    <div style={{ padding: '20px' }}>
      <h2>Welcome, {user?.username}! <Link to="/profile">My Profile</Link>
      </h2> 

      {/* Create Task */}
      <h3>Create Task</h3>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          required
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <span>Priorities</span>
        <select
        name="priority"
        value={formData.priority}
        onChange={handleChange}
        style={{ marginBottom: '10px', padding: '8px', borderRadius: '4px' }}
        >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
</select>
<input
  type="date"
  name="dueDate"
  value={formData.dueDate}
  onChange={handleChange}
  style={{ marginBottom: '10px', padding: '8px', borderRadius: '4px' }}
/>
        <button type="submit" style={{ padding: '5px 10px' }}>Add Task</button>
      </form>

      {/* Board View */}
      <h3>Task Board</h3>
      <input
  type="text"
  placeholder="Search by Title or Assigned User"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  style={{
    marginBottom: '20px',
    padding: '10px',
    width: '300px',
    borderRadius: '5px',
    border: '1px solid #ccc'
  }}
/>

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: '20px' }}>
          {statuses.map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    background: '#f0f0f0',
                    padding: '10px',
                    width: '300px',
                    minHeight: '500px',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <h4 style={{ textAlign: 'center' }}>{status}</h4>

                  {tasks
                    .filter((task) =>
                        task.status === status &&
                        (task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        task.assignedTo?.username?.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map((task, index) => (
                      <Draggable draggableId={task._id} index={index} key={task._id}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              userSelect: 'none',
                              padding: '16px',
                              margin: '0 0 8px 0',
                              minHeight: '50px',
                              backgroundColor: '#fff',
                              color: '#333',
                              borderRadius: '5px',
                              ...provided.draggableProps.style,
                            }}
                          >
                            {editTaskId === task._id ? (
                              <>
                                <input
                                  type="text"
                                  value={editForm.title}
                                  name="title"
                                  onChange={handleEditChange}
                                  placeholder="Title"
                                />
                                <input
                                  type="text"
                                  value={editForm.description}
                                  name="description"
                                  onChange={handleEditChange}
                                  placeholder="Description"
                                />
                                <button onClick={() => saveEdit(task._id)} style={{ marginRight: '5px' }}>Save</button>
                                <button onClick={cancelEdit}>Cancel</button>
                              </>
                            ) : (
                              <>
                                <h5>{task.title}</h5>
                                <p>{task.description}</p>
                                <p><strong>Priority:</strong> {task.priority}</p>
                                {task.dueDate && <p><strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>}

                                <small>Assigned to: {task.assignedTo?.username}</small>
                                <br />
                                <button
                                  onClick={() => startEdit(task)}
                                  style={{
                                    marginTop: '5px',
                                    marginRight: '5px',
                                    background: 'blue',
                                    color: 'white',
                                    border: 'none',
                                    padding: '5px 10px',
                                    borderRadius: '4px',
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(task._id)}
                                  style={{
                                    marginTop: '5px',
                                    background: 'red',
                                    color: 'white',
                                    border: 'none',
                                    padding: '5px 10px',
                                    borderRadius: '4px',
                                  }}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Dashboard;
