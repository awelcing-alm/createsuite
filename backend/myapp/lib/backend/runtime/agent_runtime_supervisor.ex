defmodule Backend.Runtime.AgentRuntimeSupervisor do
  use DynamicSupervisor

  alias Backend.Agents
  alias Backend.Agents.Agent
  alias Backend.Runtime.AgentRuntime

  def start_link(arg \\ []) do
    DynamicSupervisor.start_link(__MODULE__, arg, name: __MODULE__)
  end

  @impl true
  def init(_arg) do
    DynamicSupervisor.init(strategy: :one_for_one)
  end

  def ensure_started(%Agent{} = agent) do
    case Registry.lookup(Backend.Runtime.AgentRegistry, agent.id) do
      [{pid, _value}] ->
        {:ok, pid}

      [] ->
        DynamicSupervisor.start_child(
          __MODULE__,
          {AgentRuntime, AgentRuntime.initial_state(agent)}
        )
    end
  end

  def ensure_started(agent_id) when is_binary(agent_id) do
    case Registry.lookup(Backend.Runtime.AgentRegistry, agent_id) do
      [{pid, _value}] ->
        {:ok, pid}

      [] ->
        with {:ok, agent} <- Agents.get_agent(agent_id) do
          DynamicSupervisor.start_child(
            __MODULE__,
            {AgentRuntime, AgentRuntime.initial_state(agent)}
          )
        end
    end
  end

  def stop_agent(agent_id) do
    case Registry.lookup(Backend.Runtime.AgentRegistry, agent_id) do
      [{pid, _value}] -> DynamicSupervisor.terminate_child(__MODULE__, pid)
      [] -> :ok
    end
  end
end
