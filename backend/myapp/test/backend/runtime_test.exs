defmodule Backend.RuntimeTest do
  use Backend.DataCase, async: false

  alias Backend.Agents
  alias Backend.Runtime.AgentRuntime
  alias Backend.Runtime.AgentRuntimeSupervisor
  alias Backend.Runtime.AgentRegistry

  describe "AgentRuntime" do
    setup do
      {:ok, agent} =
        Agents.create_agent(%{name: "rt-#{:rand.uniform(99999)}", capabilities: ["test"]})

      on_exit(fn -> AgentRuntimeSupervisor.stop_agent(agent.id) end)
      %{agent: agent}
    end

    test "start_link/1 starts GenServer registered via AgentRegistry", %{agent: agent} do
      assert Agents.runtime_alive?(agent.id)
    end

    test "get_state/1 returns initial state with agent_id, status :idle, empty mailbox", %{
      agent: agent
    } do
      state = AgentRuntime.get_state(agent.id)
      assert state.agent_id == agent.id
      assert state.status == :idle
      assert state.current_task_id == nil
      assert state.mailbox == []
    end

    test "assign_task/2 transitions to :working, sets current_task_id, broadcasts", %{
      agent: agent
    } do
      state = AgentRuntime.assign_task(agent.id, "task-abc")
      assert state.status == :working
      assert state.current_task_id == "task-abc"
    end

    test "complete_task/2 transitions to :idle, clears current_task_id", %{agent: agent} do
      AgentRuntime.assign_task(agent.id, "task-abc")
      state = AgentRuntime.complete_task(agent.id, "task-abc")
      assert state.status == :idle
      assert state.current_task_id == nil
    end

    test "heartbeat/1 updates last_heartbeat timestamp", %{agent: agent} do
      %{last_heartbeat: before_ts} = AgentRuntime.get_state(agent.id)
      Process.sleep(10)
      %{last_heartbeat: after_ts} = AgentRuntime.heartbeat(agent.id)
      assert after_ts > before_ts
    end

    test "deliver_message/2 adds message to mailbox", %{agent: agent} do
      msg = %{sender: "alice", content: "hello"}
      AgentRuntime.deliver_message(agent.id, msg)
      %{mailbox: mailbox} = AgentRuntime.get_state(agent.id)
      assert Enum.any?(mailbox, fn m -> m.content == "hello" end)
    end

    test "stop/1 terminates GenServer", %{agent: agent} do
      agent_id = agent.id
      AgentRuntime.stop(agent_id)
      refute Agents.runtime_alive?(agent_id)
    end
  end

  describe "AgentRuntimeSupervisor" do
    test "ensure_started/1 starts new child" do
      assert {:ok, agent} =
               Agents.create_agent(%{
                 name: "sup-start-#{:rand.uniform(99999)}",
                 capabilities: ["x"]
               })

      on_exit(fn -> AgentRuntimeSupervisor.stop_agent(agent.id) end)
      assert AgentRuntimeSupervisor.ensure_started(agent.id) |> elem(0) == :ok
    end

    test "ensure_started/1 on already started returns {:ok, pid}" do
      assert {:ok, agent} =
               Agents.create_agent(%{
                 name: "sup-already-#{:rand.uniform(99999)}",
                 capabilities: ["x"]
               })

      on_exit(fn -> AgentRuntimeSupervisor.stop_agent(agent.id) end)
      assert {:ok, _pid} = AgentRuntimeSupervisor.ensure_started(agent.id)
    end

    test "stop_agent/1 terminates child and returns :ok" do
      assert {:ok, agent} =
               Agents.create_agent(%{
                 name: "sup-stop-#{:rand.uniform(99999)}",
                 capabilities: ["x"]
               })

      agent_id = agent.id
      assert :ok = AgentRuntimeSupervisor.stop_agent(agent_id)
      Process.sleep(5)
      refute Agents.runtime_alive?(agent_id)
    end

    test "stop_agent/1 on non-existent returns :ok" do
      assert :ok = AgentRuntimeSupervisor.stop_agent("00000000-0000-0000-0000-000000000001")
    end
  end

  describe "BootReconciler" do
    test "run/1 is disabled in test env" do
      assert Application.get_env(:backend, :start_boot_reconciler) == false
    end
  end
end
