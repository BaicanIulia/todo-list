import {
  Alert,
  Box,
  Button,
  Dialog,
  MenuItem,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dropdown } from '../Dropdown/component';
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuid } from 'uuid';
import { addTodo, updateTodo } from '../../slices/todoSlice';
import dayjs from 'dayjs';
import { Todo } from '../../types/types';

type Props = {
  type: string;
  modalOpen: boolean;
  setModalOpen: (value: boolean) => void;
  todo?: Todo;
};
export const TodoModal = ({ type, modalOpen, setModalOpen, todo }: Props) => {
  const dispatch = useDispatch();

  const initialState = {
    title: '',
    status: 'incomplete',
    priority: 'low',
    dueDate: null as string | null,
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (type === 'update' && todo) {
      setFormData({
        title: todo.title ?? '',
        status: todo.status ?? 'incomplete',
        priority: todo.priority ?? 'low',
        dueDate: todo.dueDate ?? null,
      });
    } else {
      setFormData(initialState);
    }
  }, [type, todo, modalOpen]);

  const handleDropdownChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTextInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (newValue: dayjs.Dayjs | null) => {
    setFormData((prev) => ({
      ...prev,
      dueDate: newValue ? newValue.toISOString() : null,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { title, status, priority, dueDate } = formData;
    const todoPayload = {
      id: type === 'add' ? uuid() : todo?.id,
      title,
      status,
      priority,
      ...(status === 'incomplete' && {
        dueDate: dueDate ?? null,
      }),
    };

    if (title && status && priority) {
      if (type === 'add') {
        dispatch(addTodo(todoPayload));
      }
      if (type === 'update') {
        if (
          todo?.title !== title ||
          todo.status !== status ||
          todo.priority !== priority ||
          todo.dueDate !== dueDate
        ) {
          dispatch(updateTodo({ ...todo, ...todoPayload }));
        }
      }
      setModalOpen(false);
    }
  };

  return (
    <Dialog
      onClose={() => setModalOpen(false)}
      open={modalOpen}
      sx={{
        '& .MuiDialog-paper': {
          width: '600px',
          maxWidth: '100%',
          minWidth: '300px',
        },
      }}
    >
      {formData.dueDate &&
        new Date(formData.dueDate) < new Date() &&
        formData.status === 'incomplete' && (
          <Alert severity="warning">
            The due date has passed. Make sure to update your task!
          </Alert>
        )}
      <form onSubmit={(e) => handleSubmit(e)}>
        <Typography
          sx={{
            fontSize: '2rem',
            margin: '2rem',
          }}
        >
          {type === 'add' ? 'Add' : 'Updated'} TODO
        </Typography>
        <TextField
          label="Title"
          name="title"
          variant="outlined"
          value={formData.title}
          onChange={handleTextInputChange}
          required
          sx={{
            width: '94%',
            marginTop: '0.5rem',
            paddingX: '1rem',
          }}
        />
        <Box
          sx={{
            width: formData.status === 'incomplete' ? '97%' : '99%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Dropdown
            value={formData.status}
            name="status"
            handleChange={(e) => handleDropdownChange(e)}
          >
            <MenuItem value="incomplete">Incomplete</MenuItem>
            <MenuItem value="complete">Complete</MenuItem>
          </Dropdown>

          {formData.status === 'incomplete' && (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Due Date"
                name="dueDate"
                value={formData.dueDate ? dayjs(formData.dueDate) : null}
                onChange={handleDateChange}
              />
            </LocalizationProvider>
          )}
        </Box>

        <Box sx={{ width: '94%' }}>
          <Dropdown
            value={formData.priority}
            name="priority"
            handleChange={(e) => handleDropdownChange(e)}
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </Dropdown>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
          }}
        >
          <Button variant="contained" type="submit">
            {type === 'add' ? 'Add Task' : 'Update Task'}
          </Button>
          <Button variant="outlined" onClick={() => setModalOpen(false)}>
            CANCEL
          </Button>
        </Box>
      </form>
    </Dialog>
  );
};
