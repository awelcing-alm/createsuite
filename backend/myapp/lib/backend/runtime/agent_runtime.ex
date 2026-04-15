defmodule Backend.Runtime.AgentRuntime do
  use GenServer, restart: :transient

  alias Backend.Agents.Agent
  alias Backend.PubSub.Topics

  def start_link(%{agent_id: agent_id} = initial_state) do
    GenServer.start_link(__MODULE__, initial_state,
      name: Backend.Runtime.AgentRegistry.via_tuple(agent_id)
    )
  end

  def initial_state(%Agent{id: agent_id, status: status, current_task_id: current_task_id}) do
    %{
      agent_id: agent_id,
      status: status_to_atom(status),
      current_task_id: current_task_id,
      last_heartbeat: DateTime.utc_now(),
      mailbox: []
    }
  end

  def get_state(agent_id),
    do: GenServer.call(Backend.Runtime.AgentRegistry.via_tuple(agent_id), :get_state)

  def assign_task(agent_id, task_id),
    do: GenServer.call(Backend.Runtime.AgentRegistry.via_tuple(agent_id), {:assign_task, task_id})

  def complete_task(agent_id, task_id),
    do:
      GenServer.call(Backend.Runtime.AgentRegistry.via_tuple(agent_id), {:complete_task, task_id})

  def heartbeat(agent_id),
    do: GenServer.call(Backend.Runtime.AgentRegistry.via_tuple(agent_id), :heartbeat)

  def deliver_message(agent_id, message),
    do:
      GenServer.cast(
        Backend.Runtime.AgentRegistry.via_tuple(agent_id),
        {:deliver_message, message}
      )

  def stop(agent_id),
    do: GenServer.stop(Backend.Runtime.AgentRegistry.via_tuple(agent_id), :normal)

  @impl true
  def init(%{agent_id: agent_id} = state) do
    Phoenix.PubSub.broadcast(Backend.PubSub, Topics.agent(agent_id), {:agent_started})
    {:ok, state}
  end

  @impl true
  def handle_call(:get_state, _from, state), do: {:reply, state, state}

  def handle_call({:assign_task, task_id}, _from, state) do
    next_state = %{
      state
      | status: :working,
        current_task_id: task_id,
        last_heartbeat: DateTime.utc_now()
    }

    broadcast_status(next_state)
    {:reply, next_state, next_state}
  end

  def handle_call({:complete_task, task_id}, _from, state) do
    next_task_id = if state.current_task_id == task_id, do: nil, else: state.current_task_id

    next_state = %{
      state
      | status: :idle,
        current_task_id: next_task_id,
        last_heartbeat: DateTime.utc_now()
    }

    broadcast_status(next_state)
    {:reply, next_state, next_state}
  end

  def handle_call(:heartbeat, _from, state) do
    next_state = %{state | last_heartbeat: DateTime.utc_now()}
    {:reply, next_state, next_state}
  end

  @impl true
  def handle_cast({:deliver_message, message}, state) do
    {:noreply, %{state | mailbox: [message | state.mailbox]}}
  end

  @impl true
  def terminate(_reason, state) do
    Phoenix.PubSub.broadcast(Backend.PubSub, Topics.agent(state.agent_id), {:agent_stopped})
    :ok
  end

  defp broadcast_status(state) do
    payload = %{
      id: state.agent_id,
      status: Atom.to_string(state.status),
      current_task_id: state.current_task_id,
      last_heartbeat: state.last_heartbeat
    }

    Phoenix.PubSub.broadcast(
      Backend.PubSub,
      Topics.agent(state.agent_id),
      {:agent_status_changed, payload}
    )
  end

  defp status_to_atom("working"), do: :working
  defp status_to_atom(_), do: :idle
end
