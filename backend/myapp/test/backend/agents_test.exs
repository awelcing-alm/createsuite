defmodule Backend.AgentsTest do
  use Backend.DataCase, async: false

  alias Backend.Agents

  test "create_agent/1 with valid data creates an agent and runtime" do
    attrs = %{name: "test-agent-#{:rand.uniform(99999)}", capabilities: ["frontend"]}

    assert {:ok, agent} = Agents.create_agent(attrs)
    on_exit(fn -> Backend.Runtime.AgentRuntimeSupervisor.stop_agent(agent.id) end)
    agent_id = agent.id

    assert agent.name =~ "test-agent-"
    assert agent.capabilities == ["frontend"]
    assert Agents.runtime_alive?(agent.id)

    assert %{agent_id: ^agent_id, status: :idle} =
             Backend.Runtime.AgentRuntime.get_state(agent.id)
  end

  describe "get_agent/1" do
    test "success" do
      attrs = %{name: "get-agent-#{:rand.uniform(99999)}", capabilities: ["x"]}
      assert {:ok, agent} = Agents.create_agent(attrs)
      on_exit(fn -> Backend.Runtime.AgentRuntimeSupervisor.stop_agent(agent.id) end)
      assert {:ok, found} = Agents.get_agent(agent.id)
      assert found.id == agent.id
    end

    test "not found" do
      assert {:error, :not_found} = Agents.get_agent("00000000-0000-0000-0000-000000000001")
    end
  end

  describe "update_agent/2" do
    test "success - updates fields" do
      attrs = %{name: "upd-agent-#{:rand.uniform(99999)}", capabilities: ["x"]}
      assert {:ok, agent} = Agents.create_agent(attrs)
      on_exit(fn -> Backend.Runtime.AgentRuntimeSupervisor.stop_agent(agent.id) end)
      assert {:ok, updated} = Agents.update_agent(agent.id, %{status: "offline"})
      assert updated.status == "offline"
    end
  end

  describe "delete_agent/1" do
    test "success - stops runtime" do
      attrs = %{name: "del-agent-#{:rand.uniform(99999)}", capabilities: ["x"]}
      assert {:ok, agent} = Agents.create_agent(attrs)
      agent_id = agent.id
      assert {:ok, _} = Agents.delete_agent(agent_id)
      refute Agents.runtime_alive?(agent_id)
    end
  end

  describe "set_working/2" do
    test "updates agent status to working via runtime" do
      attrs = %{name: "work-agent-#{:rand.uniform(99999)}", capabilities: ["x"]}
      assert {:ok, agent} = Agents.create_agent(attrs)
      on_exit(fn -> Backend.Runtime.AgentRuntimeSupervisor.stop_agent(agent.id) end)
      assert {:ok, updated} = Agents.set_working(agent.id, agent.id)
      assert updated.status == "working"
    end
  end

  describe "set_idle/1" do
    test "updates agent status to idle" do
      attrs = %{name: "idle-agent-#{:rand.uniform(99999)}", capabilities: ["x"]}
      assert {:ok, agent} = Agents.create_agent(attrs)
      on_exit(fn -> Backend.Runtime.AgentRuntimeSupervisor.stop_agent(agent.id) end)
      Agents.set_working(agent.id, agent.id)
      assert {:ok, updated} = Agents.set_idle(agent.id)
      assert updated.status == "idle"
    end
  end

  describe "runtime_alive?/1" do
    test "true when runtime started" do
      attrs = %{name: "alive-agent-#{:rand.uniform(99999)}", capabilities: ["x"]}
      assert {:ok, agent} = Agents.create_agent(attrs)
      on_exit(fn -> Backend.Runtime.AgentRuntimeSupervisor.stop_agent(agent.id) end)
      assert Agents.runtime_alive?(agent.id)
    end

    test "false when runtime stopped" do
      attrs = %{name: "dead-agent-#{:rand.uniform(99999)}", capabilities: ["x"]}
      assert {:ok, agent} = Agents.create_agent(attrs)
      agent_id = agent.id
      Backend.Runtime.AgentRuntimeSupervisor.stop_agent(agent_id)
      refute Agents.runtime_alive?(agent_id)
    end
  end
end
