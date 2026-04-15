defmodule BackendWeb.AgentLive.Index do
  use BackendWeb, :live_view

  alias Backend.Agents
  alias Backend.PubSub.Topics

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(Backend.PubSub, Topics.agents())
    end

    {:ok,
     socket
     |> assign(page_title: "Agents")
     |> stream(:agents, Agents.list_agents())}
  end

  @impl true
  def handle_info(_event, socket) do
    {:noreply, stream(socket, :agents, Agents.list_agents(), reset: true)}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <Layouts.app flash={@flash}>
      <.header>
        Agents
        <:subtitle>Live fleet overview.</:subtitle>
      </.header>

      <div id="agents" phx-update="stream" class="space-y-3">
        <div :for={{dom_id, agent} <- @streams.agents} id={dom_id} class="card bg-base-200 p-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <.link navigate={~p"/dashboard/agents/#{agent.id}"} class="font-semibold underline">
                {agent.name}
              </.link>
              <p class="text-sm opacity-70">{Enum.join(agent.capabilities, ", ")}</p>
            </div>
            <p class="capitalize text-sm">{agent.status}</p>
          </div>
        </div>
      </div>
    </Layouts.app>
    """
  end
end
