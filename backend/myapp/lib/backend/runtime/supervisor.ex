defmodule Backend.Runtime.Supervisor do
  use Supervisor

  def start_link(arg \\ []) do
    Supervisor.start_link(__MODULE__, arg, name: __MODULE__)
  end

  @impl true
  def init(_arg) do
    children =
      [
        Backend.Runtime.AgentRegistry,
        Backend.Runtime.AgentRuntimeSupervisor
      ] ++ boot_reconciler_children()

    Supervisor.init(children, strategy: :one_for_one)
  end

  defp boot_reconciler_children do
    if Application.get_env(:backend, :start_boot_reconciler, true) do
      [Backend.Runtime.BootReconciler]
    else
      []
    end
  end
end
