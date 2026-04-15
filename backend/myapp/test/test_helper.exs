Application.put_env(:backend, BackendWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "Cv/3w9/Oge1wUrBztWZ8xq59G1nF+Xv+i0nGLsoR9BN+wTqPqivU3sEksqZAJ/s8",
  server: false
)

Application.put_env(:backend, Backend.Repo,
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: 10
)

Application.put_env(:backend, :start_boot_reconciler, false)

ExUnit.start()
