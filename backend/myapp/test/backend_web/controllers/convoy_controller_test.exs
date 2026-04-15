defmodule BackendWeb.ConvoyControllerTest do
  use BackendWeb.ConnCase, async: false

  alias Backend.Convoys
  alias Backend.Tasks

  setup do
    {:ok, conn: Phoenix.ConnTest.build_conn()}
  end

  describe "GET /api/convoys" do
    test "returns list of convoys with progress", %{conn: conn} do
      conn = get(conn, "/api/convoys")
      assert %{"success" => true, "data" => %{"convoys" => _}} = json_response(conn, 200)
    end
  end

  describe "POST /api/convoys" do
    test "creates convoy with tasks returns 201", %{conn: conn} do
      {:ok, task} = Tasks.create_task(%{title: "Convoy task", priority: "medium"})
      conn = post(conn, "/api/convoys", %{name: "New convoy", task_ids: [task.id]})
      assert %{"success" => true, "data" => %{"convoy" => convoy}} = json_response(conn, 201)
      assert convoy["name"] == "New convoy"
      assert convoy["progress"]["total"] == 1
    end
  end

  describe "GET /api/convoys/:id" do
    test "returns convoy by cs_id with tasks and progress", %{conn: conn} do
      {:ok, task} = Tasks.create_task(%{title: "Show task", priority: "medium"})
      {:ok, convoy} = Convoys.create_convoy(%{name: "Show convoy", task_ids: [task.id]})
      conn = get(conn, "/api/convoys/#{convoy.convoy.cs_id}")
      assert %{"success" => true, "data" => %{"convoy" => found}} = json_response(conn, 200)
      assert found["name"] == "Show convoy"
    end
  end

  describe "POST /api/convoys/:id/tasks" do
    test "adds tasks to convoy", %{conn: conn} do
      {:ok, task1} = Tasks.create_task(%{title: "Task 1", priority: "medium"})
      {:ok, task2} = Tasks.create_task(%{title: "Task 2", priority: "medium"})
      {:ok, convoy} = Convoys.create_convoy(%{name: "Add tasks convoy", task_ids: [task1.id]})
      conn = post(conn, "/api/convoys/#{convoy.convoy.id}/tasks", %{"taskIds" => [task2.id]})
      assert %{"success" => true, "data" => %{"convoy" => _updated}} = json_response(conn, 200)
    end
  end

  describe "DELETE /api/convoys/:id" do
    test "deletes convoy returns deleted:true", %{conn: conn} do
      {:ok, task} = Tasks.create_task(%{title: "Orphan task", priority: "medium"})
      {:ok, convoy} = Convoys.create_convoy(%{name: "Delete convoy", task_ids: [task.id]})
      conn = delete(conn, "/api/convoys/#{convoy.convoy.id}")
      assert %{"success" => true, "data" => %{"deleted" => true}} = json_response(conn, 200)
    end
  end
end
