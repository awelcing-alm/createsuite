defmodule Backend.ConvoysTest do
  use Backend.DataCase, async: false

  alias Backend.{Convoys, Tasks}

  test "create_convoy/1 with tasks computes progress" do
    assert {:ok, task} = Tasks.create_task(%{title: "Convoy task", priority: "high"})

    assert {:ok, convoy} = Convoys.create_convoy(%{name: "Release convoy", task_ids: [task.id]})

    assert convoy.convoy.name == "Release convoy"
    assert convoy.progress.total == 1
    assert convoy.progress.completed == 0
    assert Enum.any?(convoy.tasks, &(&1.id == task.id))
  end

  describe "get_convoy/1" do
    test "by cs_id returns convoy with progress" do
      assert {:ok, task} = Tasks.create_task(%{title: "Convoy task", priority: "medium"})
      assert {:ok, convoy} = Convoys.create_convoy(%{name: "Find convoy", task_ids: [task.id]})
      assert {:ok, found} = Convoys.get_convoy(convoy.convoy.cs_id)
      assert found.convoy.id == convoy.convoy.id
      assert found.progress.total == 1
    end

    test "not found returns error" do
      assert {:error, :not_found} = Convoys.get_convoy("cs-cv-99999")
    end
  end

  describe "add_tasks/2" do
    test "adds tasks to convoy" do
      assert {:ok, task1} = Tasks.create_task(%{title: "Task 1", priority: "medium"})
      assert {:ok, task2} = Tasks.create_task(%{title: "Task 2", priority: "medium"})

      assert {:ok, convoy} =
               Convoys.create_convoy(%{name: "Add tasks convoy", task_ids: [task1.id]})

      assert {:ok, updated} = Convoys.add_tasks(convoy.convoy.id, [task2.id])
      task_ids = Enum.map(updated.tasks, & &1.id)
      assert task1.id in task_ids
      assert task2.id in task_ids
    end
  end

  describe "delete_convoy/1" do
    test "deletes convoy" do
      assert {:ok, task} = Tasks.create_task(%{title: "Orphan task", priority: "medium"})
      assert {:ok, convoy} = Convoys.create_convoy(%{name: "Delete convoy", task_ids: [task.id]})
      convoy_id = convoy.convoy.id
      assert {:ok, _} = Convoys.delete_convoy(convoy_id)
      assert {:error, :not_found} = Convoys.get_convoy(convoy.convoy.cs_id)
    end
  end
end
