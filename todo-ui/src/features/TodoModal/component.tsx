import {
  Alert,
  Box,
  Button,
  Dialog,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { DateSelector, Dropdown, TextInput } from '@components';
import React, { useState, useEffect, ChangeEvent } from 'react';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import { Todo } from '@types';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '@lib/constants';
import { useAddItemMutation, useUpdateItemMutation } from '@store/api/todosApi';

type TodoModalProps = {
  modalOpen: boolean;
  setModalOpen: (value: boolean) => void;
  todo?: Todo | null;
};

type TodoItemState = {
  title: string;
  status: 'complete' | 'incomplete';
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
};

const initialState: TodoItemState = {
  title: '',
  status: 'incomplete',
  priority: 'low',
  dueDate: null,
};

export const TodoModal = ({
  modalOpen,
  setModalOpen,
  todo,
}: TodoModalProps) => {
  const [formData, setFormData] = useState<TodoItemState>(initialState);
  const [addItem] = useAddItemMutation();
  const [updateItem] = useUpdateItemMutation();

  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title ?? '',
        status: todo.status ?? 'incomplete',
        priority: todo.priority ?? 'low',
        dueDate: todo.dueDate ?? null,
      });
    } else {
      setFormData(initialState);
    }
  }, [todo]);

  const handleChange = (
    e: SelectChangeEvent<string> | ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (type: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [type]: value }));
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

    if (!title || !status || !priority) return;

    const todoPayload = {
      id: todo ? todo?.id : uuid(),
      title,
      status,
      priority,
      ...(status === 'incomplete' && {
        dueDate: dueDate ?? undefined,
      }),
      createdAt: todo ? todo.createdAt : new Date().toISOString(),
    };

    if (todo) {
      const hasChanges =
        todo.title !== title ||
        todo.status !== status ||
        todo.priority !== priority ||
        todo.dueDate !== dueDate;

      if (hasChanges) {
        updateItem({ id: todo.id, todoItem: todoPayload });
      }
    } else {
      addItem(todoPayload);
    }
    setFormData(initialState);
    setModalOpen(false);
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
      <form
        onSubmit={handleSubmit}
        style={{
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <Typography variant="h3">{todo ? 'Update' : 'Add'} TODO</Typography>
        <TextInput
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
        />
        <Box
          sx={{
            display: 'flex',
            gap: 2,
          }}
        >
          <Dropdown
            value={formData.status}
            name="status"
            label="Status"
            onChange={handleDropdownChange('status')}
            options={STATUS_OPTIONS.filter((option) => option.value !== 'all')}
          />
          {formData.status === 'incomplete' && (
            <DateSelector
              dueDate={formData.dueDate}
              onChange={handleDateChange}
            />
          )}
        </Box>
        <Dropdown
          value={formData.priority}
          name="priority"
          label="Priority"
          onChange={handleDropdownChange('priority')}
          options={PRIORITY_OPTIONS.filter((option) => option.value !== 'all')}
        />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Button variant="contained" type="submit">
            {todo ? 'Update Task' : 'Add Task'}
          </Button>
          <Button variant="outlined" onClick={() => setModalOpen(false)}>
            CANCEL
          </Button>
        </Box>
      </form>
    </Dialog>
  );
};
