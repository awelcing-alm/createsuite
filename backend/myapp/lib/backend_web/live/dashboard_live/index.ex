defmodule BackendWeb.DashboardLive.Index do
  use BackendWeb, :live_view

  alias Backend.{Agents, Convoys, Tasks}
  alias Backend.PubSub.Topics

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(Backend.PubSub, Topics.system())
      Phoenix.PubSub.subscribe(Backend.PubSub, Topics.agents())
      Phoenix.PubSub.subscribe(Backend.PubSub, Topics.tasks())
      Phoenix.PubSub.subscribe(Backend.PubSub, Topics.convoys())
    end

    {:ok, assign(socket, dashboard_assigns())}
  end

  @impl true
  def handle_info(_event, socket) do
    {:noreply, assign(socket, dashboard_assigns())}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <Layouts.app flash={@flash}>
      <.header>
        CreateSuite Dashboard
        <:subtitle>Live system status for tasks, agents, and convoys.</:subtitle>
      </.header>

      <div class="grid gap-4 md:grid-cols-3">
        <div class="card bg-base-200 p-4">
          <p class="text-sm opacity-70">Tasks</p>
          <p class="text-3xl font-semibold">{@task_count}</p>
        </div>
        <div class="card bg-base-200 p-4">
          <p class="text-sm opacity-70">Agents</p>
          <p class="text-3xl font-semibold">{@agent_count}</p>
        </div>
        <div class="card bg-base-200 p-4">
          <p class="text-sm opacity-70">Convoys</p>
          <p class="text-3xl font-semibold">{@convoy_count}</p>
        </div>
      </div>

      <div class="card bg-base-200 p-4">
        <p class="text-sm opacity-70">System health</p>
        <p class="text-lg font-medium capitalize">{@health}</p>
      </div>

      <div class="flex flex-wrap gap-3">
        <.button navigate={~p"/dashboard/tasks"}>View Tasks</.button>
        <.button navigate={~p"/dashboard/agents"}>View Agents</.button>
        <.button navigate={~p"/dashboard/convoys"}>View Convoys</.button>
      </div>
    </Layouts.app>
    """
  end

  defp dashboard_assigns do
    %{
      page_title: "Dashboard",
      task_count: Tasks.count_tasks(),
      agent_count: Agents.count_agents(),
      convoy_count: Convoys.count_convoys(),
      health: "ok"
    }
  end
end
