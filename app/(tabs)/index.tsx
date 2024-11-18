import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Task {
  id: string;
  text: string;
  status: boolean;
  animationValue?: Animated.Value;
}

export default function App() {
  const [task, setTask] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isEditClicked, setIsEditClicked] = useState<boolean>(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  // Load tasks from AsyncStorage when the app starts
  useEffect(() => {
    loadTasks();
  }, []);

  // Save tasks to AsyncStorage whenever they change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Save tasks to AsyncStorage
  const saveTasks = async (tasksToSave: Task[]): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(tasksToSave);
      await AsyncStorage.setItem('@sampleToDoTasks', jsonValue);
    } catch (e) {
      console.error('Error saving tasks to AsyncStorage:', e);
    }
  };

  // Load tasks from AsyncStorage
  const loadTasks = async (): Promise<void> => {
    try {
      const jsonValue = await AsyncStorage.getItem('@sampleToDoTasks');
      if (jsonValue != null) {
        setTasks(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('Error loading tasks from AsyncStorage:', e);
    }
  };

  // Add a new task with animation
  const addTask = (): void => {
    if (task.trim()) {
      const animationValue = new Animated.Value(0); // Initialize animation value
      const newTask: Task = {
        id: Date.now().toString(),
        text: task,
        status: false,
        animationValue, // Attach animation value to task
      };
      setTasks([...tasks, newTask]);
      // Animate opacity to fade in the new task
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      setTask('');
    }
  };

  // Delete task
  const deleteTask = (taskId: string): void => {
    setTasks((prevTasks) => prevTasks.filter((item) => item.id !== taskId));
  };

  // Mark task as completed
  const markAsCompleted = (taskId: string): void => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: true } : task
      )
    );
  };

  // Edit task
  const editTaskFun = (taskId: string): void => {
    const tempTask = tasks.find((item) => item.id === taskId);
    if (tempTask) {
      setEditTask(tempTask);
      setTask(tempTask.text);
      setIsEditClicked(true);
    } else {
      Alert.alert(`Task doesn't exist`);
    }
  };

  // Save edited task
  const editDone = (): void => {
    if (editTask) {
      if (task.trim()) {
        setTasks((prevTasks) =>
          prevTasks.map((tsk) =>
            tsk.id === editTask.id ? { ...tsk, text: task } : tsk
          )
        );
        setTask('');
      }
    } else {
      Alert.alert(`Task doesn't exist`);
    }
    setIsEditClicked(false);
  };

  // Clear completed tasks
  const clearCompletedTasks = (): void => {
    setTasks((prevTasks) => prevTasks.filter((task) => !task.status));
  };

  return (
    <View style={styles.container}>
      {isEditClicked ? (
        <>
          <Text>Edit your task here</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={`${task}`}
              value={task}
              onChangeText={(text) => setTask(text)}
            />
            <TouchableOpacity style={styles.doneButton} onPress={editDone}>
              <Text style={styles.done}>Done</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.title}>Simple To-Do List</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Add a new task"
              value={task}
              onChangeText={(text) => setTask(text)}
            />
            <TouchableOpacity style={styles.addButton} onPress={addTask}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={tasks}
            renderItem={({ item }) => (
              <Animated.View
                style={[styles.taskContainer, { opacity: item.animationValue || 1 }]}
              >
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => editTaskFun(item.id)}
                >
                  <Text
                    style={[
                      styles.taskText,
                      { textDecorationLine: item.status ? 'line-through' : 'none' },
                    ]}
                  >
                    {item.text}
                  </Text>
                </TouchableOpacity>
                {!item.status && (
                  <View style={styles.tools}>
                    <TouchableOpacity onPress={() => markAsCompleted(item.id)}>
                      <Text style={styles.editbutton}>Done</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteTask(item.id)}>
                      <Text style={styles.deleteButton}>X</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Animated.View>
            )}
            keyExtractor={(item) => item.id}
          />
          <TouchableOpacity
            style={styles.clearCompletedButton}
            onPress={clearCompletedTasks}
          >
            <Text style={styles.clearCompletedButtonText}>Clear Completed</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    top: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    top: 17,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#5C5CFF',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    marginLeft: 10,
  },
  doneButton: {
    backgroundColor: 'green',
    padding: 10,
    borderColor: 'black',
  },
  done: {
    color: 'white',
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  tools: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '30%',
  },
  taskText: {
    fontSize: 16,
    color: '#333',
    width: '100%',
  },
  editbutton: {
    color: 'blue',
    fontSize: 15,
    fontWeight: '600',
  },
  editBtn: {
    width: '60%',
  },
  deleteButton: {
    color: '#FF5C5C',
    fontWeight: 'bold',
    fontSize: 18,
    width: 20,
  },
  clearCompletedButton: {
    backgroundColor: 'red',
    height: 40,
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
    alignSelf:'center',
    bottom: 90,
  },
  clearCompletedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
