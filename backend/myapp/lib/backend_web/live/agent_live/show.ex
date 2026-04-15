defmodule BackendWeb.AgentLive.Show do
  use BackendWeb, :live_view

  alias Backend.{Agents, Messaging, Tasks}
  alias Backend.PubSub.Topics

  @impl true
  def mount(%{"id" => id}, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(Backend.PubSub, Topics.agents())
      Phoenix.PubSub.subscribe(Backend.PubSub, Topics.agent(id))
      Phoenix.PubSub.subscribe(Backend.PubSub, Topics.tasks())
      Phoenix.PubSub.subscribe(Backend.PubSub, Topics.messages(id))
    end

    {:ok, load_agent(socket, id)}
  end

  @impl true
  def handle_info(_event, socket) do
    {:noreply, load_agent(socket, socket.assigns.agent_id)}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <Layouts.app flash={@flash}>
      <.header>
        {@agent.name}
        <:subtitle>{@agent.id}</:subtitle>
        <:actions>
          <.button navigate={~p"/dashboard/agents"}>Back to agents</.button>
        </:actions>
      </.header>

      <div class="space-y-3">
        <div class="card bg-base-200 p-4">
          <p><strong>Status:</strong> {@agent.status}</p>
          <p><strong>Capabilities:</strong> {Enum.join(@agent.capabilities, ", ")}</p>
          <p><strong>Current task:</strong> {@agent.current_task_id || "None"}</p>
          <p><strong>Runtime:</strong> {runtime_status(@runtime_state)}</p>
        </div>

        <div class="card bg-base-200 p-4">
          <p class="font-semibold mb-2">Assigned tasks</p>
          <ul class="space-y-1">
            <li :for={task <- @tasks}>
              <.link navigate={~p"/dashboard/tasks/#{task.cs_id}"} class="underline">{task.title}</.link>
            </li>
            <li :if={@tasks == []} class="opacity-70">No assigned tasks.</li>
          </ul>
        </div>

        <div class="card bg-base-200 p-4">
          <p class="font-semibold mb-2">Mailbox</p>
          <ul class="space-y-2">
            <li :for={message <- @messages}>
              <span class="font-medium">{message.sender}:</span> {message.content}
            </li>
            <li :if={@messages == []} class="opacity-70">No messages.</li>
          </ul>
        </div>
      </div>
    </Layouts.app>
    """
  end

  defp load_agent(socket, id) do
    case Agents.get_agent(id) do
      {:ok, agent} ->
        assign(socket,
          page_title: agent.name,
          agent_id: id,
          agent: agent,
          tasks: Enum.filter(Tasks.list_tasks(), &(&1.assigned_agent_id == agent.id)),
          messages: Messaging.list_agent_messages(agent.id),
          runtime_state: runtime_state(agent.id)
        )

      {:error, :not_found} ->
        push_navigate(put_flash(socket, :error, "Agent not found"), to: ~p"/dashboard/agents")
    end
  end

  defp runtime_state(agent_id) do
    if Agents.runtime_alive?(agent_id),
      do: Backend.Runtime.AgentRuntime.get_state(agent_id),
      else: nil
  end

  defp runtime_status(nil), do: "stopped"
  defp runtime_status(state), do: Atom.to_string(state.status)
end
